---
title: Chang Yong Mun
lang: ko
translationKey: home
publish: true
date: 2026-09-08
tags: [about]
description: 보안 회사 프론트엔드 엔지니어. React 마이그레이션, SSE 위에 올린 AI 조사 인터페이스, 프론트엔드 플랫폼.
---

프론트엔드 엔지니어. [AhnLab](https://www.ahnlab.com)에서 일합니다.

지금 하는 일은 핵심 제품의 Vue/Nuxt → React 마이그레이션을 이끄는 것입니다.
그래서 현재형은 React와 TypeScript이고, Vue/Nuxt는 이 블로그의 오래된 글들이 온 곳입니다.

그 옆에서 만드는 것들:

- **AI 기반 실시간 조사 인터페이스** — SSE로 들어오는 에이전트 이벤트 스트림 위에 올린 AI 트리아지와 AI 인베스티게이션
- **독립 배포되는 모듈** — Module Federation, 컨테이너, Harbor, Jenkins, Helm, Kubernetes
- **공용 프론트엔드 라이브러리** — 컴포넌트·디자인 토큰·훅·유틸. 사내 npm 레지스트리로 배포하고, 다른 팀과 함께 관리하며, 세 개 제품 팀이 씁니다
- Monaco 기반 보안 정책 DSL 편집 화면, 그리고 OTP와 액세스·리프레시 토큰 라이프사이클을 다룬 엔터프라이즈 인증 마이그레이션
- 사내 선례가 없던 양방향 운영 세션의 소켓 수명·생존 확인·재연결. 제가 만든 것이 아니라 참여한 쪽입니다

에이전트 워크플로를 시스템으로 정리해서 마이그레이션 완료 처리량을 75% 이상 올린 것도 이 일의 일부입니다.

## 회사 밖에서

오픈소스에 냅니다. 대부분 작은 수정이고, 재현을 먼저 붙입니다.

- 머지됨 — [openai/openai-node #2512](https://github.com/openai/openai-node/pull/2512),
  [huggingface/hf-mcp-server #238](https://github.com/huggingface/hf-mcp-server/pull/238)
- 열려 있음 — [anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript/pull/1163),
  [anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python/pull/1877),
  [claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript/pull/451),
  [openai-agents-js](https://github.com/openai/openai-agents-js/pull/1763)
- [zod 디스커션에 채택된 답변](https://github.com/colinhacks/zod/discussions/5936) 하나

## 글

답이 정해진 튜토리얼보다는, **직접 부딪혀서 알게 된 것**을 남기는 쪽에 가깝습니다.
동작하지 않은 방법과 그 이유도 함께 씁니다.

- [엔지니어링](engineering/) — 깊이 들어간 글. 아키텍처, 디버깅, 성능
- [노트](notes/) — 짧은 참고용 메모

`projects/`와 `retrospectives/` 섹션은 아직 비어 있습니다. 글이 생기면 여기에 링크됩니다.

## 어디서 찾을 수 있는지

- GitHub: [@cmun2](https://github.com/cmun2)
- 이전 블로그: [cmun2.inblog.io](https://cmun2.inblog.io) (이 사이트로 옮기는 중)
