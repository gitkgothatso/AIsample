package com.enkitstudio.restaurant.shared.authentication.infrastructure.primary;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.*;

import com.enkitstudio.restaurant.account.infrastructure.secondary.CustomUserDetailsService;
import com.enkitstudio.restaurant.shared.authentication.domain.Role;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(JwtAuthenticationProperties.class)
@EnableMethodSecurity(securedEnabled = true)
class SecurityConfiguration {

  private final JwtAuthenticationProperties properties;
  private final CorsFilter corsFilter;
  private final HandlerMappingIntrospector introspector;

  public SecurityConfiguration(JwtAuthenticationProperties properties, CorsFilter corsFilter, HandlerMappingIntrospector introspector) {
    this.properties = properties;
    this.corsFilter = corsFilter;
    this.introspector = introspector;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public UserDetailsService userDetailsService(CustomUserDetailsService customUserDetailsService) {
    return customUserDetailsService;
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder);
    return provider;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http, DaoAuthenticationProvider authenticationProvider) throws Exception {
    // @formatter:off
    http
      .authenticationProvider(authenticationProvider)
      .csrf(csrf -> csrf.disable())
      .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
      .headers(headers -> headers
        .contentSecurityPolicy(csp -> csp.policyDirectives(properties.getContentSecurityPolicy()))
        .frameOptions(FrameOptionsConfig::deny)
        .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
        .permissionsPolicyHeader(permissions ->
          permissions.policy("camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=()"))
      )
      .formLogin(AbstractHttpConfigurer::disable)
      .httpBasic(AbstractHttpConfigurer::disable)
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(authz -> authz
        .requestMatchers(antMatcher(HttpMethod.OPTIONS, "/**")).permitAll()
        .requestMatchers(antMatcher("/app/**")).permitAll()
        .requestMatchers(antMatcher("/i18n/**")).permitAll()
        .requestMatchers(antMatcher("/content/**")).permitAll()
        .requestMatchers(antMatcher("/swagger-ui/**")).permitAll()
        .requestMatchers(antMatcher("/swagger-ui.html")).permitAll()
        .requestMatchers(antMatcher("/v3/api-docs/**")).permitAll()
        .requestMatchers(antMatcher("/test/**")).permitAll()
        .requestMatchers(antMatcher("/")).permitAll()
        .requestMatchers(antMatcher("/login")).permitAll()
        .requestMatchers(antMatcher("/register")).permitAll()
        .requestMatchers(antMatcher("/activate")).permitAll()
        .requestMatchers(antMatcher("/password-reset")).permitAll()
        .requestMatchers(antMatcher("/index.html")).permitAll()
        .requestMatchers(antMatcher("/*.js")).permitAll()
        .requestMatchers(antMatcher("/*.css")).permitAll()
        .requestMatchers(antMatcher("/*.ico")).permitAll()
        .requestMatchers(antMatcher("/*.png")).permitAll()
        .requestMatchers(antMatcher("/*.svg")).permitAll()
        .requestMatchers(antMatcher("/*.woff")).permitAll()
        .requestMatchers(antMatcher("/*.woff2")).permitAll()
        .requestMatchers(antMatcher("/assets/**")).permitAll()
        .requestMatchers(antMatcher(HttpMethod.POST,"/api/authenticate")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/authenticate")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/register")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/activate")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/account/reset-password/init")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/account/reset-password/finish")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/test/**")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/admin/**")).hasAuthority(Role.ADMIN.key())
        .requestMatchers(new MvcRequestMatcher(introspector, "/api/**")).authenticated()
        .requestMatchers(new MvcRequestMatcher(introspector, "/management/health")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/management/health/**")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/management/info")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/management/prometheus")).permitAll()
        .requestMatchers(new MvcRequestMatcher(introspector, "/management/**")).hasAuthority(Role.ADMIN.key())
        .anyRequest().authenticated()
      );

      var jwtConfigurer = new JWTConfigurer(authenticationTokenReader());
      http.with(jwtConfigurer, Customizer.withDefaults());
      return http.build();
    // @formatter:on
  }

  @Bean
  @ConditionalOnMissingBean
  AuthenticationTokenReader authenticationTokenReader() {
    return new JwtReader(Jwts.parser().verifyWith(signingKey()).build());
  }

  private SecretKey signingKey() {
    return Keys.hmacShaKeyFor(properties.getJwtBase64Secret().getBytes(StandardCharsets.UTF_8));
  }
}
