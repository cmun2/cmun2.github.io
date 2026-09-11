---
title: tsconfig.json 파일 요소
lang: ko
translationKey: tsconfig-json-fields
publish: true
date: 2024-07-17
modified: 2025-04-17
tags: [typescript]
description: Typescript | Typescript
sourceUrl: https://cmun2.inblog.io/tsconfigjson-%ED%8C%8C%EC%9D%BC-%EC%9A%94%EC%86%8C-52543
sourceId: 52543
sourceCategory: Typescript
---

`skipLibCheck`

- 정의 파일의 타입 확인을 건너 뛸 지 여부(모든 선언파일의(`*.d.ts`) 타입검사를 스킵)

- node\_modules에 라이브러리 타입의 두 개 복사본이 있을 때

- TypeScript 버전을 업데이트하는 동안 변경 사항이 node\_modules와 JS 표준 라이브러리에서 문제를 일으킬 때(TypeScript 업데이트 중에 이러한 문제를 처리하고 싶지 않을 때)

- 전부 다 검사하게 되면 컴파일러가 느려질 수 있어 true로 사용한다고 한다.

- 사례: [Do not skipLibCheck · Issue #15 · sindresorhus/tsconfig](https://github.com/sindresorhus/tsconfig/issues/15)

- d.ts 파일을 직접 만들때는 오히려 타입 체킹이 제대로 안되어 문제가 될 수 있다.

`forceConsistentCasingInFileNames`

- 동일 파일 참조에 대해 일관성 없는 대소문자를 비활성화합니다.

- 리눅스와 맥에서는 파일이 대소문자가 다르면 파일을 못찾는것과 달리 윈도우에서는 대문자와 소문자 구분을 잘 못하여 엄격한 타입 체킹을 스킵할 수도 있어 그 부분을 해결하기 위해 보통 true로 사용한다고 한다.

Reference

[TSConfig Reference - Docs on every TSConfig option](https://www.typescriptlang.org/tsconfig/#skipLibCheck)
