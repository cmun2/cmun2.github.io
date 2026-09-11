---
title: Webpack5 Module Federation
lang: ko
translationKey: webpack5-module-federation
publish: true
date: 2023-05-11
modified: 2025-04-24
tags: [micro-frontend, module-federation, webpack]
description: MSA | MSA
sourceUrl: https://cmun2.inblog.io/webpack5-module-federation-53239
sourceId: 53239
sourceCategory: MSA
---

### Module Federation

- Micro-Frontends 의 근간이 되는 기술

- Webpack 5에 추가된 기능

- 컴포넌트, 서비스 단위를 각각 빌드하고 런타임에 Host 애플리케이션에서 동적으로 실행할 수 있게 함

- Webpack 설정 시 플러그인으로 import하여 사용할 수 있음

  - exposes: 외부에 노출할 원격 모듈

  - remotes: 사용할 원격 모듈을 설정

  - shared:

    - 공유 모듈로서 여러 컨테이너에서 같이 사용하며 런타임에 한 번만 로딩됨

    - 예) vue, react

### Module Federation의 필요성

- 빌드 및 배포 시간 감소

- 검증 범위의 감소

- 로딩 시간의 감소

### Module Federation 사용법

- Remote 앱

```
// vue.config.js
new webpack.container.ModuleFederationPlugin({
        name: "vueRemote",
        filename: "remoteEntry.js",
        remotes: {},
        exposes: {
          "./ComponentA.vue": "{path}/ComponentA.vue",
        },
        shared: {
          vue: {
            singleton: true,
          },
        },
      }),
```

- Host 앱

```vue
// vue.config.js
new webpack.container.ModuleFederationPlugin({
        name: "host",
        filename: "remoteEntry.js",
        remotes: {
          vueRemote:
            "vueRemote@<https://localhost:8081/remoteEntry.js>",
        },
        exposes: {},
        shared: {
          vue: {
            singleton: true,
          },
        },
      }),
// Home.vue
<template>
	<ComponentA />
</template>
<script lang="ts>
...
components: {
	ComponentA: defineAsyncComponent(() => import("vueRemote/ComponentA.vue")),
},
...
</script>
```

### 주의할 점

1. Typescript 사용 시 원격 모듈의 타입을 알기 어려우므로 타입 정의 파일(\*.d.ts)을 별도로 정의해야 함

2. 배포 시 remoteEntry.js의 경로

   1. local, dev, stage, production 별로 파일의 경로, URL이 다르므로 webpack 설정 파일을 분리하거나 환경 변수로 받아 빌드해야 함

3. Entry를 비동기로 가져오는 것을 권장

   1. webpack에 설정하는 entry를 기존에 main.ts로 설정했었다면 index.ts에서 main.ts를 import하여 사용하는 방식 필요

   2. 비동기 컴포넌트(defineAsyncComponent) import 방식 사용
