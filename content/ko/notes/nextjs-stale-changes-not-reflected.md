---
title: Next.JS 변경된 내용이 바로 반영이 안되는 문제 발생 해결
lang: ko
translationKey: nextjs-stale-changes-not-reflected
publish: true
date: 2025-04-21
modified: 2025-04-21
tags: [nextjs]
description: Next.js | Next.js
sourceUrl: https://cmun2.inblog.io/nextjs-%EB%B3%80%EA%B2%BD%EB%90%9C-%EB%82%B4%EC%9A%A9%EC%9D%B4-%EB%B0%94%EB%A1%9C-%EB%B0%98%EC%98%81%EC%9D%B4-%EC%95%88%EB%90%98%EB%8A%94-%EB%AC%B8%EC%A0%9C-%EB%B0%9C%EC%83%9D-%ED%95%B4%EA%B2%B0-52894
sourceId: 52894
sourceCategory: Next.js
---

- 개요

  - 개인 프로젝트에 Next.js를 도입하는 상황에서 코드를 변경했을 때 즉각 로컬 서버에서 반영이 되어야 하는데 문제가 생기는 상황

- `Next.js`에서 변경된 내용이 바로 반영이 안되는 문제 발생

  - 윈도우 + WSL2 문제 의심

    - `WATCHPACK_POLLING=true`를 설정한 이유는 파일 변경 감지를 위한 **폴링(polling) 방식**을 활성화시키기 위함입니다. 기본적으로 `Next.js`는 파일 시스템 이벤트를 감지하는데 **파일 시스템 이벤트 기반 감지**를 사용합니다. 그러나 이 방식은 특정 환경에서 (예: 가상 머신, Docker, 네트워크 파일 시스템 등) 잘 작동하지 않거나 파일 시스템 변경을 제대로 감지하지 못하는 경우가 있을 수 있습니다.

    - 폴링 방식은 주기적으로 디스크를 확인하여 변경된 파일을 감지하는 방식으로, 파일 시스템 이벤트를 감지할 수 없는 환경에서도 작동합니다. `WATCHPACK_POLLING=true` 환경 변수를 설정하면, `Next.js`가 폴링 방식으로 파일 변경을 감지하도록 강제하게 되어 변경 사항이 즉시 반영됩니다.

    - 이 방식이 효과를 본 이유는 아마도 개발 환경에서 파일 시스템 이벤트 기반 감지가 제대로 동작하지 않았거나, 특정 설정에서 파일 변경을 감지하는데 문제가 발생했기 때문으로 의심

    - `WATCHPACK_POLLING=true`로 설정하면 **파일 시스템 이벤트를 감지하지 못하는 경우 폴링 방식을 사용하여** 변경 사항을 감지하고, Fast Refresh가 제대로 작동하도록 도와줍니다.

```
// package.json
"scripts": {
    "dev": "WATCHPACK_POLLING=true next dev", //WATCHPACK_POLLING 옵션 활성화
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
```

Reference: <https://github.com/vercel/next.js/issues/36774#issuecomment-1438324196>
