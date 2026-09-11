---
title: Jest를 활용한 테스트 코드 설정(2)
lang: ko
translationKey: jest-test-setup-2
publish: true
date: 2023-03-31
modified: 2026-06-21
tags: [jest, testing]
description: Jest | Jest
sourceUrl: https://cmun2.inblog.io/jest%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%BD%94%EB%93%9C-%EC%84%A4%EC%A0%952-52736
sourceId: 52736
sourceCategory: Jest
---

개요

- Form, 양방향 바인딩, 전역 데이터 관리, 라우팅에 관련한 Jest 테스팅을 진행

## **Form 형식 코드 테스트 코드**

### Form 기본 워크플로우

![](images/jest-test-setup-2/01.png)![](images/jest-test-setup-2/02.png)

Form을 제출할 때 필요한 요소 테스트코드 기본 체크

- input에 update될 데이터 추가

- 해당 input을 반영시킬 button 이벤트 트리거

- assertion 파트에서 submit이라는 event가 emit되고 해당 데이터가 <my@mail.com>으로 예상

### Form 고급 워크플로우

![](images/jest-test-setup-2/03.png)![](images/jest-test-setup-2/04.png)![](images/jest-test-setup-2/05.png)

- 모든 이벤트에 대한 async/await 비동기 처리

- 아래의 setValue()가 빈 값으로도 전달되는 이유는 해당 부분을 실행하지 않을시 OPTION, CHECKBOX, RAIDIO input의 디폴트 값은 checked 상태로 될 것이다.

![](images/jest-test-setup-2/06.png)

- 특별한 메소드(prevent, stop 등)를 실행시키기 위해 trigger에 해당 event에 대한 string을 넣을 수 있다.

## **데이터 컴포넌트 전송 처리에 대한 테스트코드**

### 패스워드 컴포넌트

![](images/jest-test-setup-2/07.png)![](images/jest-test-setup-2/08.png)

- 패스워드에 대한 길이 또는 복잡도에 대한 테스트

- 해당 테스트코드 컴포넌트를 모든 프로젝트에 사용하기 위해 minLength를 prop으로 설정하고 \<Password>에 전달

- error computed 속성에서 해당 minLength길이보다 짧은 password 메세지를 설정

### setProps 활용

![](images/jest-test-setup-2/09.png)![](images/jest-test-setup-2/10.png)

- prop 변화에 대한 부작용을 감지하기 위한 테스트

- 여기서 greeting이 디폴트 값으로 렌더되는지 테스트를 하게 되는데 `show` prop을 `setProps()` 를 활용하여 greeting을 감출 수 있게 된다. `setProps()` 를 진행할 때에도 assertion 부분이 진행되기 전에 DOM을 업데이트 하기 위해 await를 꼭 사용한다.

## **V-model 테스트(양방향 바인딩)**

### 한개의 v-model 테스트코드

![](images/jest-test-setup-2/11.png)![](images/jest-test-setup-2/12.png)

- v-model에서의 testing code는 mount 부분으로 해당 컴포넌트를 가지고 오고 props로 v-model에서의 modelValue와 update:modelValue를 가지고 오며 setProps를 통해 props의 값의 변경하는 부분을 감지하며 await 부분에서 input을 setValue를 통해 ‘test’라는 string으로 input 값을 넣고 props로 받은 modelValue도 v-model을 통해 ‘test’로 양방향 바인딩이 되는것을 assertion하고 있다.

### 여러개의 v-model

![](images/jest-test-setup-2/13.png)

- :value 값으로 받은 “currency”와 “modelValue” 모두 props로 내려받으며 setProps로 update되는 modelValue 값과 currency 값의 props가 바뀌는 것을 감지하고 있다.

- 이후 currencyInput과 modelValueInput에 wrapper로 input 태그를 가지고 있는 모든 부분을 찾아 array형태의 currencyInput과 modelValueInput에 넣는다.

- 마지막으로 setValue를 통해 테스트 하고자 하는 input 값을 넣고 assertion 부분에서 각각의 modelValue와 currency가 해당 값을 출력하는지 테스트를 진행한다.

## **Vuex 테스트(전역데이터 관리)**

### Vuex store에 대한 테스트

![](images/jest-test-setup-2/14.png)![](images/jest-test-setup-2/15.png)![](images/jest-test-setup-2/16.png)

- 위 구조처럼 store에서 count를 가지고와서 increment method를 store에서 mutation을 통해 실행을 할 때 테스트 해야 할 부분은 버튼이 클릭되는 부분과 해당 이벤트를 통해 카운트가 증가되는 부분을 assertion하는 부분이다.

- 일반적으로 app.use(store)를 Vuex 플러그인에서 진행하는 것처럼 테스트코드에서도 `global.plugins` 마운팅 옵션을 통해 Vuex 플러그인을 설치하게 도와준다.

- global.plugins를 통해 store를 마운트 한 이후에 await 중에 click을 trigger하고 assertion부분에서 Count: 1이 되는 것을 예상하고 있다.

### 컴포넌트와 Vuex 스토어 분리 테스트

- 해당 방법은 큰 application이며 매우 복잡한 store에 대한 테스트를 진행시켜주기 위한 테스트

- `global.mocks` 를 활용하여 테스트를 진행하고 싶은 store의 부분을 테스트 진행하게 된다.

![](images/jest-test-setup-2/17.png)

- global.plugins를 통해 설치하는것과 달리 개인 mock store를 만들어 컴포넌트에서 실제 사용하는 부분의 Vuex 부분만 테스트 진행하게 된다.

- store를 분리 테스트 하는 것은 편할 수 있지만 Vuex store가 무너뜨려질 시 따로 경고를 주지 않게 된다.

#### Vuex 내에서의 분리테스트(mutation or action 과정 등)

- Vuex store 자체에서는 Vue Test를 따로 적용시키지 않아도 되는 부분이 Vuex store 자체는 보통 Javascript이기 때문에 javascript에서 쓰는 테스트 코드 표현을 아래와 같이 사용하면 된다.

![](images/jest-test-setup-2/18.png)

### Vuex에서 프리세팅 설정

- 테스트를 진행하기 전에 Vuex store에 유저가 원하는 기본 세팅 값이 있으면 유용한 경우에 대한 테스트(특정 상태)

- `global.mocks`를 사용하는 것이 아닌 `createStore` 자체를 감싸는 함수를 만들고 기본 state 값을 설정하는 코드 구성을 진행하면 된다.

![](images/jest-test-setup-2/19.png)

- `createVuexStore`함수 생성을 통해서 간단하게 초기 설정 값을 만들고 위에 코드처럼 count가 20 또는 -10 상태의 store 상태를 만들고 store에 increment를 통해 mutation을 진행하게 되면 assertion 파트에서 21 또는 5의 값이 나오도록 예상하고 있다.

## **Vue Router에서의 테스트 코드**

- Real Vue Router : 생산성은 크지만 복잡도가 높은 테스팅 방법

- Mocked Router: 복잡도가 낮아 쉽게 컨트롤 할 수 있는 테스팅 방법

### Mocked Router 테스트

- 전체적인 유닛테스트가 아닌 관심있는 부분만 테스트 진행

- `jest.mock`과 `global.components` 사용

- \<router-link>가 맞는 페이지에 이동하게 되는지 테스트 클릭에 대해선 궁금하진 않지만 해당 \<a> 태그가 맞는 to 속성을 가지고 있는지 궁금할 수 있다.

![](images/jest-test-setup-2/20.png)![](images/jest-test-setup-2/21.png)![](images/jest-test-setup-2/22.png)

- 해당 컴포넌트는 버튼을 클릭하게 되면 인증이 완료된 유저에게 편집할 수 있는 페이지로 리다이렉트 하게 가는 방식인데 인증처리 되지 않은 유저는 /404 페이지로 리다이렉트 된다.

- 여기서 리다이렉트 되는 과정을 모드 테스트 할 수도 있지만 개발자가 궁금한 부분은 인증처리되면 X 페이지로 가고 인증처리 되지 않은 유저는 Y 페이지로 가게되는 것이 큰 목적.

- wrapper에서 `global.mocks`를 활용하여 this.$route와 this.$router를 사용 가능하게 하고 이후 jest.fn()을 활용하여 몇번 routing이 진행되었는지 어디로 가게 되었는지 또한 확인 가능하다.(toHaveBeenCalledTimes, toHaveBeenCalledWith)

### Composition API를 활용한 Mocked Router 테스트

![](images/jest-test-setup-2/23.png)![](images/jest-test-setup-2/24.png)![](images/jest-test-setup-2/25.png)

- router 와 route를 다이렉트로 mock test 하게 된다.

### Composition API를 활용한 Real Router 테스트

![](images/jest-test-setup-2/26.png)

- Options API를 활용하며 app에서 다이렉트로 router를 가져오는 것이 아닌 새로운 router object를 테스트마다 실행시키게 진행한다.

- jest.fn() 함수는 가짜 함수(mock function)을 생성할 수 있도록 도와준다.

Reference:

[Getting Started · Jest](https://jestjs.io/docs/getting-started)

[Vue Test Utils](https://test-utils.vuejs.org/api/)

[Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/)

[Vue Test Utils](https://test-utils.vuejs.org/guide/)

[GitHub - vuejs/vue-test-utils-typescript-example: Example project using TypeScript, Jest + vue-test-utils together](https://github.com/vuejs/vue-test-utils-typescript-example)
