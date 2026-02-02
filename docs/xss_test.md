---
title: XSS Security Test
template: Article
---

# Security Test

This page contains malicious code. If security is working, **nothing should happen**.

## Test 1: Script Tag
<script>
    alert('XSS Attack Successful! Security Failed!');
    document.body.style.backgroundColor = 'red';
</script>

## Test 2: Image OnError
<img src="x" onerror="alert('Image XSS Successful!')" />

## Test 3: Link Javascript
[Malicious Link](javascript:alert('Link XSS!'))

If you see red background or alerts, `allowScripts` is TRUE or Sanitization is broken.
