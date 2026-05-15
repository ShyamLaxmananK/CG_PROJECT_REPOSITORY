package com.turf.payment.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @Before("execution(* com.turf.payment..*(..))")
    public void logBefore(
            JoinPoint joinPoint) {

        System.out.println(
                "Executing: "
                        + joinPoint.getSignature()
        );
    }
}