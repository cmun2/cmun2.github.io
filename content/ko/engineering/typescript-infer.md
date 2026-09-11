---
title: Typescript의 infer를 통한 타입 추론
lang: ko
translationKey: typescript-infer
publish: true
date: 2024-07-22
modified: 2025-04-20
tags: [typescript]
description: Typescript | Typescript
sourceUrl: https://cmun2.inblog.io/typescript%EC%9D%98-infer%EB%A5%BC-%ED%86%B5%ED%95%9C-%ED%83%80%EC%9E%85-%EC%B6%94%EB%A1%A0-52744
sourceId: 52744
sourceCategory: Typescript
---

타입 관련

- 문제 상황

  - 한 장치에는 유니크한 타입의속성을 가지고 있어서 이 속성을 가지고 정확한 장비 타입에 해당하는 데이터를 가져올 수 있다.

  - 현재 서버에서 받아오는 정보에는 아래 deviceType으로 선언되어 있는데 새로 생성한 NewDeviceInfo는 실제 유효한 4개의 장비 타입에 대한 프로파일만 들고 있는 상황

    - 아래에서 변수는 임의로 작성하였다.

      ```typescript
export const DEVICE_TYPE = {
  FIRST_DEVICE: 'first',
  SECOND_DEVICE: 'second',
  THIRD_DEVICE: 'third',
  FOURTH_DEVICE: 'fourth',
  FIFTH_DEVICE: 'fifth',
  SIXTH_DEVICE: 'sixth',
} as const;
export type DeviceTypeValue = ValueType<typeof DEVICE_TYPE>;
```

      ```javascript
export type DeviceNewType = FirstDevice | SecondDevice | ThirdDevice | FourthDevice
```

  - DeviceNewType에 들어갈 수 있는 장비 타입에는 특정 타입들이 없어서 서버에서 받아온 장치 정보의 타입을 새로운 전역 저장소에 세팅할 수가 없는 문제가 발생

- 해결방안

  - 처음에는 Pick을 사용해서 몇몇 타입을 제외한 타입만 새로 정의하려고 했는데, 대입은 불가능 하였다.

  - 그래서, 모든 타입을 가져와서 새로운 타입으로 정의하면 대입할 수 있지 않을까 라는 생각으로 특정 속성의 타입을 추출하는 헬퍼 타입을 정의함

```
type ExtractDeviceType<T> = T extends { device_type: infer U } ? U : never;
// infer U는 T 타입이 가지고 있는 device_type이라는 속성의 타입을 U로 추론하도록 지시
// T 타입의 device_type이 'FirstDevice' 라면 'FirstDevice'를 리턴
// T 타입의 device_type이 없으면 never를 리턴
```

```
type AllDeviceTypes = ExtractDeviceType<DeviceProfile>;
// AllDeviceTypes는 'FirstDevice', 'SecondDevice', 'ThirdDevice', FourthDevice가 된다
```
