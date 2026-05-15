package com.turf.customer.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @Before("execution(* com.turf.customer.controller.*.*(..))")
    public void controllerLog(JoinPoint jp) {

        System.out.println(
                "Controller call: " + jp.getSignature());
    }

    @Before("execution(* com.turf.customer.service.*.*(..))")
    public void serviceLog(JoinPoint jp) {

        System.out.println(
                "Service call: " + jp.getSignature());
    }

    @AfterThrowing(
            pointcut = "execution(* com.turf.customer..*(..))",
            throwing = "ex"
    )
    public void exceptionLog(JoinPoint jp, Exception ex) {

        System.out.println(
                "Exception in " + jp.getSignature()
                        + " : " + ex.getMessage());
    }
}