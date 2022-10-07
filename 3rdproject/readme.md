# Project: 축구 커뮤니티 사이트

---
# Abstract
&nbsp;이전에 [MySQL을 연동시켜 REST API를 구현한 프로젝트](https://github.com/AxPlank/nodeproject/tree/main/leaguetable_mysql)에서 주어진 목표를 달성하는 것에는 성공했지만, 아쉽게도 문제점이 있었습니다. 이 프로젝트에서는 이 문제점들을 보완하고, 사용자 인증, 게시판 기능을 추가하는 시간을 가졌습니다.

---
# Introduction
## 이전 프로젝트의 문제점
&nbsp;데이터를 조회하고, 수정하고, 삭제하고, 생성하는 REST API를 구현하는것은 성공했지만, 두 가지 문제점이 따라왔습니다. 바로,

1. 리고 데이터와 관련된 테이블이 불필요하게 많이 존재한다.
2. 관리자가 아닌 인원도 데이터를 조작할 수 있게 되면서, 데이터 무결성이 깨졌다.

는 것이었습니다. 이 부분에 대해 보완이 필요하다고 생각했고, 다음의 방법으로 문제점을 해결했습니다.

1. 테이블 합치기
2. 사용자 인증 기능

## 새로운 기능
&nbsp; 단순히, 리그 테이블만 조회를 하는 것보다, 다양한 기능을 한 곳에서 이용하는 것이 좋다고 생각했습니다. 그래서 전 게시판 기능을 추가하여, 축구와 관련된 다양한 이야기를 할 수 있게 하였습니다.

---
# Object
- 사용자 인증 기능을 구현한다.
- 게시판과 관련된 REST API를 구현한다.
- 기능에 맞춰 App을 구분할 수 있다.

---
# Language and Framework

![](https://img.shields.io/badge/Node.js_18.3.0-339933?style=for-the-badge&logo=Node.js&logoColor=FFFFFF)
![](https://img.shields.io/badge/JavaScript_ES6-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=000000)
![](https://img.shields.io/badge/express_4.18.1-000000?style=for-the-badge&logo=express&logoColor=FFFFFF)
![](https://img.shields.io/badge/pug_3.0.2-A86454?style=for-the-badge&logo=pug&logoColor=000000)
![](https://img.shields.io/badge/mysql_8.0.30-4479A1?style=for-the-badge&logo=mysql&logoColor=000000)

---
# Schedule

&nbsp;화요일, 목요일, 토요일은 프로젝트 진행을 하지 않았습니다.

| 기간 | 내용 | 비고 |
|---|---|---|
| 2022/10/05 ~ 10/07 | Git/GitHub 최초 커밋 <br> 관련 API 설치 <br> static, view 등 기본 설정 <br> readme.md 파일 Schedule 항목까지 작성 |  |
| 10/09 ~ 10/16 | 리그 테이블 구현 |  |
| 10/17 ~ 10/23 | 사용자 인증 기능 구현 |  |
| 10/24 ~ 10/29 | 게시판 기능 구현 |  |
| 10/30 ~ 11/02 | 테스트 진행 <br> 디자인 구현 <br> readme.md 마무리 작성 |  |
| | | |

---
# UI & Features
## 메인

![]()

## 리그 테이블 조회

![]()

## 리그 데이터 추가

![]()

## 리그 데이터 수정 및 삭제

![]()

## 에러

![]()

---
# Feedback

---
# Reference
