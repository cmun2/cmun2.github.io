---
title: Typescript를 통한 Route Query 타입 추론
lang: ko
translationKey: typescript-route-query-inference
publish: true
date: 2024-06-24
modified: 2026-06-21
tags: [typescript]
description: Typescript | Typescript
sourceUrl: https://cmun2.inblog.io/typescript%EB%A5%BC-%ED%86%B5%ED%95%9C-route-query-%ED%83%80%EC%9E%85-%EC%B6%94%EB%A1%A0-52745
sourceId: 52745
sourceCategory: Typescript
---

```javascript
import type { LocateQueryValue } from 'vue-router';

type RouteValueType = LocateQueryValue | LocateQueryValue[] | string | string[] | number;

export const getRoutingInfo = <T extends RouteValueType>(
  value: RouteValueType,
  isTypeGuardValue: (value: RouteValueType) => value is T
): T | undefined => {
  if (isTypeGuardValue(value)) return value;

  return;
};

export function isStringType(value: RouteValueType): value is string {
  return typeof value === 'string';
```

```
state.searchKey = getRoutingInfo(route.query.searchKey, isStringType);
```

- Query의 TypeGuard를 사용하여 routing Info에 대해서 추론을 할 수 있다.

  ![](images/typescript-route-query-inference/01.png)
