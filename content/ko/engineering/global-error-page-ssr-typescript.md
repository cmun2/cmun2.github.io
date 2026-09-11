---
title: 전역 에러 페이지 생성 및 다루기(SSR/Typescript)
lang: ko
translationKey: global-error-page-ssr-typescript
publish: true
date: 2024-04-29
modified: 2025-04-19
tags: [nuxt, ssr, typescript]
description: Global Error | Nuxt.js, Next.js, Typescript
sourceUrl: https://cmun2.inblog.io/%EC%A0%84%EC%97%AD-%EC%97%90%EB%9F%AC-%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%83%9D%EC%84%B1-%EB%B0%8F-%EB%8B%A4%EB%A3%A8%EA%B8%B0ssrtypescript-52711
sourceId: 52711
sourceCategory: Nuxt.js
---

- 환경

  - Nuxt.JS

  - TypeScript

- 객체 literal type

```typescript
export const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type StatusCodeValueType = ValueType<typeof STATUS_CODE>;
```

```javascript
export type ValueType<T> = T[keyof T];
```

**인덱스 접근 타입** (`T[keyof T]`):

- `T[keyof T]`는 객체 타입 `T`의 **모든 값**을 추출하는 타입입니다.

- `keyof T`는 `T`의 모든 키를 유니언 타입으로 추출합니다. 그 다음 `T[keyof T]`는 그 키들을 통해 `T` 객체의 모든 값의 타입을 가져옵니다.

**제네릭 (Generic)**:

- `ValueType<T>`는 제네릭 타입을 사용하고 있습니다. `T`는 타입 인수로 전달되며, `T` 타입의 객체에 대해서 그 값을 추출하는 타입을 정의합니다.

`as const` 덕분에 `STATUS_CODE` 객체의 값들은 리터럴 타입으로 추론되며, `ValueType<typeof STATUS_CODE>`는 `200 | 201....|` 이라는 값들의 유니언 타입을 추출하게 됩니다.

```typescript
const globalError = useError();
const isValidStatusCode = (statusCode: number): statusCode is StatusCodeValueType => {
  const statusCodeList: number[] = Object.values(STATUS_CODE);
  return statusCodeList.includes(statusCode);
};
```

- SSR의 useError를 사용하여 전역적인 에러를 에러코드에 따라 유효한 에러코드인지 확인하고 적절하게 에러페이지를 보여줄 수 있다.

- 에러 상태에서의 각 화면은 switch문을 통해 각 케이스에서의 적절한 HTML 태그를 리턴하도록 처리하면 된다.
