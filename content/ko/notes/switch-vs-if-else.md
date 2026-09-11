---
title: Switch Statement vs If-Else Statement
lang: ko
translationKey: switch-vs-if-else
publish: true
date: 2024-07-18
modified: 2025-04-17
tags: [javascript]
description: Javascript | Javascript, Refactoring
sourceUrl: https://cmun2.inblog.io/switch-statement-vs-ifelse-statement-52544
sourceId: 52544
sourceCategory: Javascript
---

**Switch Statement**

- 예시

```
switch(x) {
  case 'value1':  // if (x === 'value1')
    ...
    [break]
  case 'value2':  // if (x === 'value2')
    ...
    [break]
  default:
    ...
    [break]
}
```

- `Switch`문의 x를 true로 돌리면 `case`에 logical expression과 integer, character 외의 값을 넣어 평가할 수 있다. 심지어 함수 또한 평가가 가능하다.

* **장단점**

  - If-else Statement

    - 장점

      - 유연함: 대부분의 컨디션을 표현하는데 있어 가독성이 좋으며 복잡한 로직도 표현하는데 있어서 쉬운편이다.

    - 단점

      - if-else 구문이 길어질수록 기존에 있던 가독성의 장점이 사라지며 표현하는 보일러플레이트가 불필요할 정도로 길어질 수 있다.

  - Switch Statement

    - 장점

      - 따로따로 구성된 케이스(string 또는 number)가 여러개 존재할 경우, 확실히 케이스별로 분리하기에 가독성이 좋아진다.

      - 구조가 한눈에 보기 좋다.

    - 단점

      - 제한성: 한가지의 표현법만 검증하기 때문에 로직이 복잡해질수록 유연성이 떨어진다.

      - break 구문을 써서 반복되는 switch 구문을 벗어나야하기 때문에 보일러플레이트가 어느정도 생길 수 있다.

* **결론**

  - 경우의 수가 적다면 속도의 차이는 크게 벗어나지 않을 수 있기 때문에 어느 방법을 써도 좋지만 break 구문을 써야 하는 switch보다는 if-else가 보일러플레이트 면에서 좋아보인다.

  - 경우의 수가 많아지고 명확히 한가지 조건에 한해서 리턴하는 경우의 수가 많아질수록 switch 구문을 써서 가독성도 올리고 점프 테이블을 만들기 때문에 if-else 조건문 보다 훨씬 빠르게 실행된다고 한다.

  - 로직이 한가지 조건이 아니고 조건 표현법이 복잡해질수록 if-else 구문을 쓰는것이 코드 구현도 쉽고 좋다.

* 리팩토링

  ```typescript
function getImageSrc(messageType: string) {
  if (messageType === 'info') {
    return 'svg/ic_re_info_default';
  } else if (messageType === 'warn') {
    return 'svg/ic_error';
  } else if (messageType === 'notice') {
    return 'svg/ic_re_info';
  } else {
    return '';
  }
```

* switch문으로 변경

  ```typescript
const getImageSrc = (messageType: string) => {
  switch (messageType) {
    case 'info':
      return 'svg/ic_re_info_default';
    case 'warn':
      return 'svg/ic_error';
    case 'notice':
      return 'svg/ic_re_info';
    default:
      return '';  
  }
}
```

* 객체로 변경

  ```typescript
const imageSrc: { [key: string]: string } = {
  'info' : 'svg/ic_re_info_default',
  'warn' : 'svg/ic_error',
  'notice' : 'svg/ic_re_info',
}
const getImageSrc = (messageType: string) => {
  return imageSrc[messageType] || '';
}
```
