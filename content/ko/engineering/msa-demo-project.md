---
title: MSA Demo Project
lang: ko
translationKey: msa-demo-project
publish: true
date: 2023-05-12
modified: 2025-04-24
tags: [micro-frontend, module-federation]
description: MSA | MSA
sourceUrl: https://cmun2.inblog.io/msa-demo-project-53240
sourceId: 53240
sourceCategory: MSA
---

## 개요

- 다른 Region 개발자의 Angular 웹과 필자의 Vue 웹을 마이크로프론트엔드 아키텍처를 활용하여 SPA의 제한 없이 웹을 실행해야 하는 상황으로 마이크로 프론트엔드 기술 검증 진행

## **Subject: Movie App**

### 프로젝트 구조

- host (Vue)

  - shell application으로 전체 micro frontend의 container 역할

- app-list (Vue)

  - remote application으로 movie list 컴포넌트를 expose 함

- react-app-detail (Vue)

  - remote application으로 movie detail 컴포넌트를 expose 함

- angular-app-about (Angular)

  - remote application으로 movie reivews 컴포넌트를 expose 함

- common-components (React)

  - remote application으로 base ui(card, navigation bar 등) 컴포넌트들을 expose 함

### 웹팩 설정

- **Webpack 5 Module Federation 플러그인 기능 사용**

  - exposes

    ```
// common-components 예시
plugins: [
  new webpack.container.ModuleFederationPlugin({
    name: 'commonComponents',
    filename: 'remoteEntry.js',
    remotes: {},
    exposes: {
      './BaseCard.vue': './src/components/card/BaseCard.vue',
      './Navigation.vue': './src/components/navigation/Navigation.vue',
      './MainTemplate.vue': './src/components/template/MainTemplate.vue',
    },
    shared: {
      vue: {
        singleton: true,
      },
    },
  }),
],
```

  - remotes

    ```
// host 예시
plugins: [
	new webpack.container.ModuleFederationPlugin({
	  name: 'host',
    filename: 'remoteEntry.js',
    remotes: {
      commonComponents: `commonComponents@${dist-url-common}/remoteEntry.js`,
      appList: `appList@${dist-url-applist}/remoteEntry.js`,
      reactAppDetail: `reactAppDetail@${dist-url-appdetail}/remoteEntry.js`,
    },
    exposes: {},
    shared: {
      vue: {
        singleton: true,
      },
    },
  }),
],
```

### 커스텀 이벤트 핸들러

- shell application(host)과 remote application(app-list) 사이의 통신을 위해 커스텀 이벤트 핸들러를 구현함

- host

```javascript
// 커스텀 이벤트 핸들러인지 확인하는 함수
function isCustomEvent(event: Event): event is CustomEvent {
      return 'detail' in event;
}
// item-click 커스텀 이벤트 핸들러 등록
window.addEventListener('item-click', (e: Event) => {
	if (!isCustomEvent(e)) throw new Error('not a custom event');
	goToMovieDetail(e);
});
```

- app-list

```typescript
<Card @click="goToMovieDetail(movie.id)"/>
function goToMovieDetail(id: number) {
  const customClickEvent = new CustomEvent('item-click', { detail: { id } });
  window.dispatchEvent(customClickEvent);
}
```

### 배포

- 하나의 Repository를 사용한다고 가정

- Jenkins의 Multibranch Pipeline을 사용하여 각 Application을 독립적으로 배포

  - 배포 Branch 분리 또는 Tag 사용

  - step을 나누어 각 프로젝트 별로 빌드 후 배포

- CloudFront, S3 를 사용하여 S3의 저장소 업데이트 및 cache invalidation
