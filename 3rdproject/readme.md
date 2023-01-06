# Project: I Love FootBall - 축구 커뮤니티 사이트

---
# Abstract
&nbsp;이전에 [MySQL을 연동시켜 REST API를 구현한 프로젝트](https://github.com/AxPlank/nodeproject/tree/main/leaguetable_mysql)에서 주어진 목표를 달성하는 것에는 성공했지만, 아쉽게도 문제점이 있었습니다. 이 프로젝트에서는 이 문제점들을 보완하고, 회원가입, 게시판 등 일반적인 커뮤니티 사이트에 존재하는 기능들을 추가하는 시간을 가졌습니다.

---
# Introduction
## 이전 프로젝트의 문제점
&nbsp;데이터를 조회하고, 수정하고, 삭제하고, 생성하는 REST API를 구현하는것은 성공했지만, 두 가지 문제점이 따라왔습니다. 바로,

1. 리그 테이블과와 관련된 데이터가 불필요하게 많이 존재한다.
2. 관리자가 아닌 인원도 데이터를 조작할 수 있기 떄문에 데이터 무결성이 깨질 우려가 있다.

는 것이었습니다. 이 부분에 대해 보완이 필요하다고 생각했고, 다음의 방법으로 문제점을 해결했습니다.

1. 테이블 통합
2. 사용자 구분

## 새로운 기능
&nbsp; 단순히, 리그 테이블만 조회를 하는 것보다, 다양한 기능을 한 곳에서 이용하는 것이 좋다고 생각했습니다. 그래서 전 게시판 기능을 추가하여, 축구와 관련된 다양한 정보를 얻을 수 있게 하였습니다.

---
# Object
- 로그인, 회원가입, 사용자 인증 기능을 구현한다.
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

&nbsp;10월 24일부터 11월 4일까지 SQLD 자격증 준비를 위해 프로젝트 진행을 하지 않았습니다.

| 기간 | 내용 | 비고 |
|---|---|---|
| 2022/10/05 ~ 10/07 | Git/GitHub 최초 커밋 <br> 관련 API 설치 <br> static, view 등 기본 설정 <br> readme.md 파일 Schedule 항목까지 작성 |  |
| 10/09 ~ 10/16 | 리그 테이블 구현 |  |
| 10/17 ~ 10/23 | 사용자 인증 기능 구현 |  |
| 10/24 ~ 10/29 | 게시판 기능 구현 |  |
| 10/30 ~ 2023/01/02 | 테스트 진행 <br> 디자인 구현 <br> readme.md 마무리 작성 |  |
| | | |

---
# UI & Features
## 메인

![](/3rdproject/readmefiles/mainpage.png)

&nbsp;사이트 메인 화면입니다. 상단의 League Tables, Board 등의 버튼을 통해 각 기능을 사용할 수 있습니다.

## 리그 테이블

### 리그 선택
![](/3rdproject/readmefiles/leaguechoice.png)

&nbsp;리그를 선택하는 화면입니다. 리그 이미지 혹은 리그 이름을 클릭하면 해당 리그의 테이블을 조회할 수 있습니다.

### 테이블
![](/3rdproject/readmefiles/leaguetable.png)

&nbsp;리그 테이블을 조회하는 화면입니다. 사용자들은 이 화면에서 각 리그의 테이블을 조회할 수 있으며, 관리자는 이 화면에서 리그 테이블을 수정할 수 있습니다.

## 게시판
![](/3rdproject/readmefiles/board.png)

&nbsp;게시판입니다. 사용자들은 각 리그에 관한 다양한 정보들을 얻을 수 있습니다. 관리자들 뿐만 아니라, 사용자들 역시 글을 작성할 수 있도록 기능을 추가할 예정입니다.

---
# Changes
## 데이터베이스
```sql
+--------------------+
| 이전 프로젝트의 DB  |
+--------------------+
| bundesliga_ger     |
| la_liga_esp        |
| leagues            |
| ligue_1_fra        |
| premier_league_eng |
| serie_a_ita        |
+--------------------+
```
&nbsp;위의 내용처럼 이전 프로젝트에서는 각 리그별로, 그리고 리그 선택을 위한 용도로 데이터 테이블을 만들었기 때문에 불필요하게 많은 테이블이 존재했습니다. 이 테이블을 줄이고자 했습니다.
1. 먼저 각 리그의 팀별 성적이 들어있는 테이블입니다. 각 리그의 테이블이 가진 속성들이 똑같다는 것을 이용했습니다. 그 결과, 5개로 나뉘어져 있던 테이블을 하나로 줄였습니다.
2. 모든 팀은 소속된 리그가 있습니다. 그렇기 때문에 모든 팀들을 모은 테이블에 소속 리그를 명시하는 속성을 추가하여, 오직 리그 선택을 위해서만 존재하는 테이블을 삭제했습니다.

```sql
+---------+--------------+------+-----+---------+----------------+
| Field   | Type         | Null | Key | Default | Extra          |
+---------+--------------+------+-----+---------+----------------+
| id      | int          | NO   | PRI | NULL    | auto_increment |
| ranking | int          | YES  |     | NULL    |                |
| team    | varchar(100) | YES  | UNI | NULL    |                |
| pl      | int          | NO   |     | NULL    |                |
| win     | int          | NO   |     | NULL    |                |
| draw    | int          | NO   |     | NULL    |                |
| lose    | int          | NO   |     | NULL    |                |
| f       | int          | NO   |     | NULL    |                |
| a       | int          | NO   |     | NULL    |                |
| gd      | int          | NO   |     | NULL    |                |
| pts     | int          | NO   |     | NULL    |                |
+---------+--------------+------+-----+---------+----------------+
```

&nbsp;위의 속성들은 바로 이전 프로젝트에 존재하던 각 리그 테이블의 속성들입니다. 해당 팀의 순위를 나타내는 항목인 ranking을 제거했습니다. ORDER BY로 정렬 후, 프론트엔드 단에서 반복문을 이용해 관련 인덱스를 추가하거나, RANK()와 같은 순위 함수를 이용해서 순위를 표시한다면, 해당 데이터는 굳이 사용할 필요가 없어지기 때문입니다. 이 프로젝트에서는 프론트엔드 단에서 반복문을 이용하여 순위를 표시하는 것으로, ranking 항목을 대체했습니다.


```sql
+--------+--------------+------+-----+---------+----------------+
| Field  | Type         | Null | Key | Default | Extra          |
+--------+--------------+------+-----+---------+----------------+
| id     | int          | NO   | PRI | NULL    | auto_increment |
| team   | varchar(100) | NO   | UNI | NULL    |                |
| league | varchar(100) | NO   |     | NULL    |                |
| pl     | int          | NO   |     | NULL    |                |
| win    | int          | NO   |     | NULL    |                |
| draw   | int          | NO   |     | NULL    |                |
| lose   | int          | NO   |     | NULL    |                |
| gf     | int          | NO   |     | NULL    |                |
| ga     | int          | NO   |     | NULL    |                |
| gd     | int          | NO   |     | NULL    |                |
| pts    | int          | NO   |     | NULL    |                |
+--------+--------------+------+-----+---------+----------------+
```
```javascript
each team, ranking in teams 
                    tr 
                        td=ranking+1
                        td=team.team 
                        td=team.pl
                        td=team.win 
                        td=team.draw 
                        td=team.lose 
                        td=team.gf 
                        td=team.ga 
                        td=team.gd 
                        td=team.pts 
```

## 관리자와 사용자의 분리
&nbsp;이전 프로젝트의 결과물에서는 관리자 뿐만 아니라 사용자도 리그 테이블과 관련된 테이블을 수정할 수 있었습니다. 그래서 회원정보가 있는 테이블에서 사용자, 관리자를 구분하여 이를 해결할 수 있었습니다.

![](/3rdproject/readmefiles/leaguetable.png)
&nbsp;관리자가 아니라면 위의 이미지처럼 단순히 테이블 조회만 할 수 있지만,
![](/3rdproject/readmefiles/leaguetable_admin.png)
관리자가 테이블을 조회할 경우, 테이블 맨 우측과 테이블 하단의 Add Team, Edit 버튼을 이용해서 테이블을 수정할 수 있습니다. 아래는 Add Team, Edit 버튼을 클릭했을 때 나오는 화면입니다.

![](/3rdproject/readmefiles/leaguetable_addteam.png)
![](/3rdproject/readmefiles/leaguetable_editteam.png)

---
# Feedback

## 구현되지 못한 기능들

&nbsp;ajax처럼 생각했던 기능 중 구현되지 못한 것들이 너무나도 많았다. 일단 기간을 맞추기 위해서 최대한 진행을 했지만, 여러 사유들로 인해 구현할 수 없었다. 이 부분들은 해당 프로젝트를 지속적으로 패치하면서, 추가할 예정이다.
