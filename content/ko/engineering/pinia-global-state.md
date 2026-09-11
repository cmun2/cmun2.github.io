---
title: Pinia를 통한 전역관리
lang: ko
translationKey: pinia-global-state
publish: true
date: 2023-09-12
modified: 2025-04-20
tags: [pinia, vue, state-management]
description: Pinia | Global State Management
sourceUrl: https://cmun2.inblog.io/pinia%EB%A5%BC-%ED%86%B5%ED%95%9C-%EC%A0%84%EC%97%AD%EA%B4%80%EB%A6%AC-52727
sourceId: 52727
sourceCategory: Global State Management
---

[**Pinia**](https://pinia.vuejs.org/)**&#x20;vs&#x20;**`useState`

- `ref`

  - **Cross-Request State Pollution 문제**

    - Vue 앱은 싱글톤으로 상태를 저장한다는 특징 때문에 여러 요청에 대해 상태를 유지해야 한다.

    - 클라이언트 사이드 렌더링, SPA에 대해서는 ref는 완벽하게 지원 가능하다.

    - 그러나 서버 사이드 렌더링에서는 서버 측에서 렌더링을 할 때마다 새로운 요청이 동일한 애플리케이션 내에서 계속 실행됨.

      - SSR은 CSR처럼 한번에 렌더링을 다 하는게 아니라 페이지를 렌더링 할때마다 서버에서 페이지를 그리려고 하기 때문이다.

    - 따라서 싱글톤 상태 객체에 대해서 모든 Request는 동일한 상태를 공유하기 때문에 상태 유지 문제, 보안 문제, 버그 가능성이 높아진다는 문제가 있다.

    - 그래서 Nuxt에서는 이를 방지하기 위해 useState를 지원한다.

- `useState`

  - **State Hydration**

    - Nuxt를 이용하여 서버 사이드 렌더링을 할 때, HTML을 생성하기 위해 앱이 서버에서 실행 될텐데 이때 초기화 를 하는 과정에서 ref를 사용하게 되면 초기화를 할 때마다 ref는 계속 다시 계산이 된다.

      - 위의 Cross-Request State Pollution 문제가 발생

    - 이미 서버에서 계산한 상태를 가져와서 HTML, CSS, Assets와 함께 클라이언트로 전송한다면 이전 상태를 유지한 채로 작업이 계속 될 수 있다.

    - 여기서 서버에서 계산한 상태를 가져오는 게 바로 Hydration

    - `ref`는 이 작업을 수행할 수 없지만 `useState`는 Hydration 기능이 내장되어 있고 자동으로 수행해준다.

    - 때문에 Nuxt에서는 `ref`가 아닌 `useState`를 권장

- [Pinia](https://pinia.vuejs.org/)

  - useState의 기능을 기본으로, 더 다양한 기능을 제공하는 Vue의 상태 관리 라이브러리

    - 에반 유에 따르면 Pinia는 Vuex5 버전이라고도 할 수 있기 때문에 Vuex보다 Pinia 사용을 권장한다고 한다.

    - 쉽게 말해 Vuex 업그레이드 버전이라고 보면 된다.

  - 애플리케이션의 크기와 복잡성이 커질 수록 더 많은 기능을 제공하는 Pinia가 유용

  - **Pinia의 주요한 DX 개선사항**

    - 개발 도구(DevTools) 통합

    - state를 구성하는 store

    - state 업데이트와 검색을 쉽게 하는 action과 getter

**useState 사용 방법**

- useState는 SSR 친화적인 ref의 대체품

- useState의 값은 서버 사이드 렌더링을 한 후에 클라이언트 사이드에 hydration 하는 도중 유지되며 고유 키를 사용할 수 있어서 모든 컴포넌트 간에 공유가 됨

```javascript
# In one component
const sharedState = useState('share-this', 'default value');
# In another component
const alsoSharedState = useState('share-this');
```

**Pinia 구축**

1. **Nuxt3에 Pinia 설치**

   1. `"dependencies": { "@pinia/nuxt": "^0.4.11", "pinia": "^2.1.6" }`

2. **nuxt.config.ts에 Pinia 모듈 추가**

   1. `export default defineNuxtConfig({ modules: [ '@pinia/nuxt', ], })`

3. **Pinia Store 구축**

- 규칙 pinia는 vuex와 달리 mutation과 action이 분리되어있지 않고 action(function)만 사용하면 된다.

- Option API 패턴 (기존 방식)

```typescript
// store/index.ts
import { defineStore } from 'pinia'
export const useTestStore = defineStore('test', {
  state: () => {
    return {
      itemList: ['dog', 'cat'],
    }
  },
  actions: {
    addValueToItemList(value: string) {
      this.itemList.push(value)
    },
  },
  getters: {
    itemList: state => state.itemList,
  },
})
```

- Composition API 패턴

```typescript
// store/index.ts
import { defineStore } from 'pinia'
export const useTestCompositionStore = defineStore('test', () => {
  const itemList = ref(['dog, cat']);
  function addValueToItemList(value: string) {
    itemList.value.push(value)
  }
  return { itemList, addValueToItemList }
})
```

- 보이는 장점

  - 동일 기능 대비 더 간결한 코드

    - `state` = `ref`

    - `getter` = `computed`

    - `action` = `function`

  - watchers 생성 가능

  - composable 사용 가능

  - app 속성 (앱에 provide 된 속성)에 inject()로 접근 가능

* **컴포넌트에서 Pinia 가져오기**

  - store에서 구조 분해 할당 시 state와 getter 속성은 storeToRefs()를 사용해야만 reactive가 유지된다.

    - function은 store 자체에 바인딩 되어 있으므로 직접 구조 분해 가능

      ```vue
<template>
  <div>
    {{ itemList }}
    <input v-model="value" />
    <button @click="addValueToFilterList(value)">+</button>
  </div>
</template>
<script setup>
import { useTestCompositionStore } from '@/store'
import { storeToRefs } from 'pinia'
const value = ref('')
const store = useTestCompositionStore()   # 컴포넌트에서 호출 시점에 store가 생성
const { addValueToItemList } = store      # action은 직접 구조 분해 할당 가능
const { itemList } = storeToRefs(store)   # storeToRefs를 사용하여 반응형 getter 유지
</script>
```

Storage 연계

- SSR에서 브라우저 Storage를 사용하여 데이터를 저장하고 로드하는 방식은 vueuse 기능으로 대체.

- SSR에서는 새로고침 시 데이터를 다시 계산하기 때문에 `ref`를 기반으로 한 `useState`를 사용하는 경우 새로고침 시 값이 초기화 된다.

  - 따라서 새로고침 시에도 데이터를 유지할 수 있도록하기 위해서는 `vueuse`의 `useLocalStroage` 컴포지블을 통해 구현

Reference: [**Pinia**](https://pinia.vuejs.org/)****
