# Project: 5대 축구 리그 순위표 - MySQL

# Introduction
&nbsp;[이전 프로젝트](https://github.com/AxPlank/nodeproject/tree/main/leaguetable)에서 Express.js를 이용해 5대 축구 리그에 대해 각 리그에 대한 순위표를 파일의 형태로 만들고, 이를 조회하는 API를 구현해 보았습니다. 이번 프로젝트에서는 파일이 아닌, 데이터베이스를 이용해 REST API를 구현해보는 프로젝트를 진행했습니다.

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
| 09/26 ~ 09/27 |  테스트 진행 및 마지막 커밋 |  |

# UI

![]()

# Features
## 리그 추가 (POST)
---

![]()

- 리그를 추가하는 기능입니다.
- 해당 리그에 소속되어 있는 팀의 성적을 입력하고, "추가" 버튼을 누르면 팀이 추가되고 이것이 순위표에 반영됩니다.

## 리그 검색 (GET)
---

![]()

- 리그의 순위표를 볼 수 있는 기능입니다.
- 조회하고자 하는 리그를 클릭하면, 해당 리그의 데이터를 불러와 화면에 출력시킵니다.

## 리그 데이터 수정 (PUT)
---

![]()

- 리그에 속해 있는 팀의 데이터를 수정하는 기능입니다.
- 수정하고자 하는 팀을 클릭하면 데이터를 수정하는 화면이 나타나고, 이 화면에서 데이터를 수정하여 리그 순위표를 최신화할 수 있습니다.
- 경기가 열릴 때 마다 리그에 소속되어 있는 팀의 데이터는 변화합니다. 그렇기 때문에 팀 성적을 수정하는 것을 통해 항상 최신의 데이터가 유지될 수 있게 했습니다.

## 팀 삭제 (DELETE)
---

![]()

- 해당 리그에 소속되어 있는 팀을 삭제하는 기능입니다.
- 대부분의 축구 리그에서 시즌이 끝날 때 최하위에 위치한 몇 개의 팀은 하부 리그로 강등됩니다. 이는 더 이상 그 팀이 해당 리그에 소속되어 있지 않다는 것을 의미합니다.
- 여기서는 5대 축구 리그를 제외한 리그는 다루지 않았기 때문에, 해당 팀을 삭제하는 것으로 강등을 구현했습니다.

# Feedback


# Reference
[1]: [Node.js로 데이터베이스 다루고 웹 애플리케이션 만들기](https://www.inflearn.com/course/node-js-database/dashboard)

[2]: [Express.js 사이트](https://expressjs.com/ko/guide/routing.html)