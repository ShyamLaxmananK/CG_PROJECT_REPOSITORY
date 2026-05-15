package com.turf.turf.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @Before("execution(* com.turf.turf.controller.*.*(..))")
    public void controllerLog(JoinPoint jp) {

        System.out.println("Controller: " + jp.getSignature());
    }

    @Before("execution(* com.turf.turf.service.*.*(..))")
    public void serviceLog(JoinPoint jp) {

        System.out.println("Service: " + jp.getSignature());
    }

    @AfterThrowing(
            pointcut = "execution(* com.turf.turf..*(..))",
            throwing = "ex"
    )
    public void exceptionLog(JoinPoint jp, Exception ex) {

        System.out.println(
                "Exception in " + jp.getSignature()
                        + " : " + ex.getMessage()
        );
    }
}