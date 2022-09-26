# Project: 5대 축구 리그 테이블 - MySQL

# Introduction
&nbsp;[이전 프로젝트](https://github.com/AxPlank/nodeproject/tree/main/leaguetable)에서 Express.js를 이용해 5대 축구 리그에 대해 각 리그의 테이블을 파일의 형태로 만들고, 이를 조회하는 API를 구현해 보았습니다. 이번 프로젝트에서는 파일이 아닌, 데이터베이스를 이용해 구현하고, 추가적으로 수정과 삭제 기능까지 구현했습니다.

# Object
- Express.js를 이용해 REST API를 구현한다.
- Node 환경에서 MySQL을 연동해 데이터를 조작한다.
- pug의 템플릿 상속 기능을 이용해 좀 더 쉽게 View를 구현한다.
- css파일 작성을 통해 디자인을 구현한다. 
- 이전 프로젝트에서 발생했던 오류를 해결한다.

# Language and Framework

![](https://img.shields.io/badge/Node.js_18.3.0-339933?style=for-the-badge&logo=Node.js&logoColor=FFFFFF)
![](https://img.shields.io/badge/JavaScript_ES6-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=000000)
![](https://img.shields.io/badge/express_4.18.1-000000?style=for-the-badge&logo=express&logoColor=FFFFFF)
![](https://img.shields.io/badge/pug_3.0.2-A86454?style=for-the-badge&logo=pug&logoColor=000000)
![](https://img.shields.io/badge/mysql_8.0.30-4479A1?style=for-the-badge&logo=mysql&logoColor=000000)

# Schedule

| 기간 | 내용 | 비고 |
|---|---|---|
| 2022/09/21 | Git/GitHub 최초 커밋 <br> MySQL 관련 API 설치 <br> DB 연결 및 View, Static 경로 설정 |  |
| 09/21 ~ 09/25 | REST API 구현 | 화, 목, 토요일은 진행하지 않음 |
| 09/26 ~ 09/28 |  테스트 진행 <br> 디자인 구현  |  |

# UI & Features
## 메인
---

![사이트 메인 화면](/leaguetable_mysql/markdown_image/Mainpage.png)

- 상단의 리그 이름을 클릭하면 해당되는 리그의 리그 테이블을 조회할 수 있습니다.

## 리그 테이블 조회
---

![리그 테이블 조회 화면](/leaguetable_mysql/markdown_image/Leagueselect.png)

- 리그 테이블을 조회할 수 있는 기능입니다.
- 조회하고자 하는 리그를 클릭하면, 해당 리그의 데이터를 불러와 화면에 출력시킵니다.

## 리그 데이터 추가
---

![리그 데이터 추가 화면](/leaguetable_mysql/markdown_image/teamadd.png)

- 리그에 소속되어 있는 팀과 그 팀의 성적을 추가하는 기능입니다.
- 팀의 이름(Team), 순위(Ranking), 경기 수(Pl), 승(Win), 무(Draw), 패(Lose)의 횟수, 득점(F), 실점(A), 골득실(GD), 승점(Pts)을 입력하고, "추가" 버튼을 누르면 데이터가 추가되고 이것이 순위표에 반영됩니다. 이때 추가된 데이터는 해당 리그의 이름을 가진 테이블에 저장됩니다.
- 데이터를 입력할 때 사람의 실수로 공백이 입력될 수 있습니다. 이를 방지하기 위해 입력값이 공백이 존재한다면, 데이터가 추가되지 않고 에러 화면으로 넘어가도록 구현했습니다.

## 리그 데이터 수정 및 삭제
---

![리그 데이터 수정 및 삭제 화면](/leaguetable_mysql/markdown_image/teameditanddelete.png)

### 리그 데이터 수정
- 리그에 소속되어 있는 팀의 성적을 수정하는 기능입니다.
- 리그 테이블을 조회하는 화면에서 해당 팀의 행에 존재하는 Edit 버튼을 누르면 팀의 성적을 수정할 수 있습니다.
- 데이터를 추가할 때와 마찬가지로 공백이 입력되지 않도록 구현했습니다.

### 리그 데이터 삭제

- 리그에 소속되어 있는 팀의 데이터를 삭제하는 기능입니다.
- 리그 데이터를 수정하는 화면에서 DELETE 버튼을 누르면 해당 팀의 데이터가 삭제됩니다.

## 에러
---

![에러 화면](/leaguetable_mysql/markdown_image/error.png)

- 에러 화면입니다.
- 데이터 전송 간 에러가 발생했거나, 혹은 데이터를 추가/수정하는 과정에서 공백이 전송되었을 때 에러가 발생하면 해당 에러 화면으로 이동하게 됩니다.
- 하단의 Back 버튼을 누르면, 에러 화면으로 넘어오기 직전의 페이지로 이동하게 됩니다.

# Feedback
## 이전 프로젝트에서 존재했던 문제점
---
``` cmd

※ 파일이 위치한 경로는 [Path]로 줄여서 표기했습니다.

[Path]\app.js:63
                teams = teams.split(',');
                              ^

TypeError: Cannot read properties of undefined (reading 'split')
    at ReadFileContext.callback ([Path]\app.js:63:31)
    at FSReqCallback.readFileAfterOpen [as oncomplete] (node:fs:320:13)

Node.js v18.3.0
Program node app.js exited with code 1

```

&nbsp;이전 프로젝트에서 나왔던 문제점입니다. 데이터를 불러오는 과정에서 데이터 타입이 String임에도 불구하고, split() 함수를 읽지 못해 발생한 오류였는데, 파일을 불러오는 대신 MySQL을 연동시키고, 쿼리문을 이용해서 데이터를 받아오면서 문제를 해결할 수 있었습니다.

## Database
---
``` sql
+--------------------+
| Tables_in_football |
+--------------------+
| bundesliga_ger     |
| la_liga_esp        |
| leagues            |
| ligue_1_fra        |
| premier_league_eng |
| serie_a_ita        |
+--------------------+
```
&nbsp;프로젝트를 진행하면서 가장 많이 들었던 생각은 데이터베이스에 존재하는 테이블 수가 많아 이를 줄일 필요가 있다는 생각이었습니다. 그래서 추후에는 팀들을 하나의 데이터에 모두 통합하고, 반복문과 정렬을 이용해 구현할 수 있는 ranking 대신 소속 리그를 넣어 데이터 관리를 좀 더 용이하게 할 예정입니다. 

## 불친절한 UX
---

&nbsp;데이터를 추가, 수정, 삭제를 할 때 일반적으로는 정말로 작업을 실행할 것인지 한 번 묻고, 해당 작업을 시작합니다. 하지만 이 프로젝트에선 이런 과정 없이 바로 작업이 실행되기 때문에 데이터의 무결성에 일부 취약점을 가지게 되었습니다. 다음 프로젝트에서는 이 부분을 수정해 취약점을 보완하도록 할 것입니다.

## 더 많은 오류 처리
---

&nbsp;현재 통신 간 코드, 혹은 서버 문제로 발생하는 에러 이외에 직접적으로 처리를 해 놓은 오류는 단 1가지입니다(입력 값에서의 공백 존재 여부). 하지만 이 오류 이외에도 데이터 무결성을 해칠 우려가 있는 오류는 더 많기 때문에 이 부분을 다음 프로젝트에서 보완 할 예정입니다.

# Reference
[1]: [Node.js로 데이터베이스 다루고 웹 애플리케이션 만들기 - Inflearn](https://www.inflearn.com/course/node-js-database/dashboard)

[2]: [favicon 및 메인화면 이미지 출처 - pixabay](https://www.pixabay.com)

[3]: [리그 테이블 출처 - Skysports](https://www.skysports.com/football/tables)