# GitHub Copilot Instructions

This repository contains CGI scripts for memo(root page) / SDV / speech capture utilities.

## environment
- Apache 2.0
- ユニケージ開発手法(using open usp Tsukubai)
- HTML and CGI

## Coding Style
- Use UTF-8 encoding.
- Smartphone compatible.
- In CGI header, write Email: k.noguchi2005@gmail.com.
- In CGI html header section, write 'echo "Content-Type: text/html"' and 'echo ""'

## Security
- Never trust user input from forms; sanitize or escape before using.
- Avoid writing to arbitrary file paths; restrict to the project directories.
- Do not expose server paths or environment variables in responses.

---
These guidelines help maintain consistency when using AI assistance. Modify as project evolves.
