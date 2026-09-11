---
title: Private Class Field
lang: ko
translationKey: private-class-field
publish: true
date: 2024-08-20
modified: 2025-04-17
tags: [javascript]
description: Javascript | Javascript
sourceUrl: https://cmun2.inblog.io/private-class-field-52545
sourceId: 52545
sourceCategory: Javascript
---

- class의 속성들은 기본적으로 public 하며 class 외부에서 읽히고 수정될 수 있다. 하지만, ES2019 에서는 해쉬 `#` prefix 를 추가해 private class 필드를 선언할 수 있게 되었다.

- Javascript에서 `_ (언더스코어)`와 `# (해시)`는 모두 클래스의 프라이빗 멤버를 나타내는데 사용되지만 그 동작과 의미에 중요한 차이가 있다.

## **\_ 언더스코어**

- 언더스코어는 변수나 메서드가 프라이빗하거나 내부적으로 사용된다는 것을 개발자 간에 알리기 위한 관례이다.

- 자바스크립트 자체에서는 이러한 멤버에 대한 접근을 제한하지 않으며 클래스 외부에서도 언더스코어로 시작하는 프로퍼티나 메서드에 접근하고 수정할 수 있다.

- 오래전부터 사용되어 대부분의 코드베이스에서 널리 사용되지만 실제로 접근을 막지는 않기 때문에 완전한 캡슐화를 제공하지 않는다.

## **# 해시**

- ECMAScript 2019(ES10)부터 도입된 공식적인 문법으로, `#`을 사용하여 정의된 필드나 메서드는 클래스 외부에서 직접 접근할 수 없다.

- 클래스 내부에서만 접근이 가능하며, 외부에서 접근하려고 하면 `SyntaxError`가 발생한다.

- 코드의 무결성을 보장하고, 외부에서 내부 구현을 변경하거나 오용하는 것을 방지한다.

```javascript
class Example {
  _privateField = 'I am conventionally private';
  #trulyPrivateField = 'I am truly private';
  getPrivateFields() {
    console.log(this._privateField); // 접근 가능
    console.log(this.#trulyPrivateField); // 접근 가능
  }
}
const example = new Example();
console.log(example._privateField); // 접근 가능 (하지만 관례적으로는 접근하지 말아야 함)
console.log(example.#trulyPrivateField); // 오류 발생
```

## **언제 무엇을 사용해야하나?**

- 최신 브라우저나 Node.js 버전을 사용하고 있다면 `#`을 사용하여 프라이빗 필드를 정의하는 것이 좋습니다. 이는 더 강력한 캡슐화와 보안을 제공한다.

- 레거시 또는 호환성을 고려하는 경우에는 언더스코어 관례를 따를 수도 있다.

**참조**

[Private class fields - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes/Private_properties)
