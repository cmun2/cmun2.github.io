---
title: 연봉 노트 옆에서 블로그를 씁니다
lang: ko
translationKey: publishing-from-one-vault
publish: true
date: 2026-09-11
tags: [obsidian, quartz, vector-search, local-first]
description: 볼트를 두 개로 나누지 않기로 한 뒤에 따라온 결정들 — 게이트 두 개, Quartz, Milvus Lite, 그리고 고르지 않고 재서 정한 임베딩 모델.
---

블로그에 올릴 초고와 연봉 협상 메모가 같은 Obsidian 볼트 안에 있습니다. 보안 회사에서 일하니 업무 중에 남긴 메모도 같은 곳에 있고요.

이 상태로 "볼트를 그대로 렌더링하는 정적 사이트"를 만들겠다는 건, 커밋 한 번 잘못하면 되돌릴 수 없는 구조를 스스로 만들겠다는 뜻입니다. 공개 저장소에 들어간 비공개 노트는 영구적입니다.

그래서 이 글은 "이런 스택을 씁니다" 소개가 아닙니다. 저 제약 하나 때문에 내려야 했던 결정들과, 그 결정을 정한 근거와, **다시 보니 근거가 아니었던 것 하나**를 적습니다.

## 볼트를 두 개로 나누지 않았습니다

가장 단순한 해법은 볼트를 둘로 쪼개는 것입니다. 공개용 하나, 비공개용 하나. 실제로 그렇게 쓰는 사람이 많고 저도 처음에는 그러려고 했습니다.

문제는 **같은 지식을 두 번 관리하게 된다**는 겁니다. SSE를 디버깅하면서 남긴 메모는 처음에는 그냥 작업 노트이고, 몇 달 뒤에 글이 됩니다. 볼트가 둘이면 그때마다 옮겨야 하고, 옮긴 다음에는 어느 쪽이 최신인지를 계속 기억해야 합니다. 기억에 의존하는 규칙은 언젠가 깨집니다.

두 번째 후보는 git 브랜치였습니다. private 브랜치에서 쓰고 public 브랜치로 필요한 것만 머지하는 방식. 이쪽이 더 나쁩니다. **브랜치는 버전 관리지 접근 경계가 아닙니다.** 실수로 한 번 커밋하면 그 노트는 히스토리에 남고, 히스토리에서 지우는 일은 상당히 번거롭습니다. 이미 push된 뒤라면 더 그렇고요.

그래서 볼트는 하나로 두고, 대신 **밖으로 나가는 길**에 손을 대기로 했습니다.

## 게이트 두 개, 서로 독립

나가는 길에 게이트를 두 개 놓았습니다. 둘 다 통과해야 글이 나갑니다.

**1 — 위치.** 파일의 *실제* 경로가 `Public/` 안에 있어야 합니다. 심볼릭 링크는 판단하기 전에 먼저 해석합니다. `Public/` 안에 놓인 링크가 커리어 노트를 가리키고 있으면 그 링크는 따라가는 게 아니라 거절됩니다. 볼트의 나머지 디렉터리는 필터링으로 걸러지는 게 아니라 **애초에 읽히지 않습니다.**

**2 — 의도.** 프론트매터에 `publish: true`가 있어야 합니다. truthy한 값이 아니라 불리언 `true`입니다. 필드가 아예 없으면 기본값으로 채우지 않고 거절합니다. **없는 것은 동의가 아닙니다.** "`publish` 필드가 없으니 false로 봤다"는 리팩터링 한 번이면 "없으니 true로 봤다"가 됩니다.

두 게이트가 서로 독립이라는 게 핵심입니다. 실수로 비공개 노트를 `Public/`로 끌어다 놓아도 게시되지 않고, 볼트 바깥 노트에 `publish: true`를 붙여도 게시되지 않습니다. 두 실수가 **동시에** 일어나야 합니다.

<figure class="diagram">
<svg viewBox="0 0 1080 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="publish-path-title publish-path-desc">
<title id="publish-path-title">The publish path and its two gates</title>
<desc id="publish-path-desc">Architecture diagram of a blog publishing pipeline. One Obsidian vault holds a private tree and a Public directory; only the Public directory feeds a location gate and an intent gate, both of which must hold, before the sync mirrors the file into the repository and the site is built. Each gate has a refused path that stops before the next stage.</desc>
<defs>
<marker id="pp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-ink)"/></marker>
<marker id="pp-arrow-muted" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-muted)"/></marker>
</defs>
<rect width="100%" height="100%" fill="var(--dg-paper)"/>
<rect x="32" y="88" width="208" height="256" rx="8" fill="var(--dg-zone)" stroke="var(--dg-zone-rule)" stroke-width="0.8"/>
<rect x="72" y="92" width="128" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="136" y="101" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.14em">ONE VAULT · LOCAL</text>
<rect x="688" y="212" width="360" height="132" rx="8" fill="var(--dg-zone)" stroke="var(--dg-zone-rule)" stroke-width="0.8"/>
<rect x="800" y="216" width="136" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="868" y="225" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.14em">PUBLIC · GITHUB</text>
<line x1="224" y1="276" x2="296" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="464" y1="276" x2="504" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="672" y1="276" x2="704" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<line x1="848" y1="276" x2="880" y2="276" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<path d="M 380,316 V 348" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="362" y1="352" x2="398" y2="352" stroke="var(--dg-muted)" stroke-width="2"/>
<path d="M 588,316 V 348" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="570" y1="352" x2="606" y2="352" stroke="var(--dg-muted)" stroke-width="2"/>
<rect x="236" y="252" width="48" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="260" y="261" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">42 NOTES</text>
<rect x="352" y="360" width="56" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="380" y="369" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">REFUSED</text>
<rect x="560" y="360" width="56" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="588" y="369" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">REFUSED</text>
<rect x="48" y="120" width="176" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="120" width="176" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="130" width="44" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="82" y="139" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">PRIVATE</text>
<text x="136" y="162" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Private tree</text>
<text x="136" y="178" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">no path leaves this box</text>
<rect x="48" y="240" width="176" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="240" width="176" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="60" y="250" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="80" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">SOURCE</text>
<text x="136" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Public/</text>
<text x="136" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">ko/ · en/</text>
<rect x="296" y="236" width="168" height="80" rx="6" fill="var(--dg-paper)"/>
<rect x="296" y="236" width="168" height="80" rx="6" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<rect x="308" y="246" width="44" height="12" rx="2" fill="none" stroke="var(--dg-accent-rule)" stroke-width="0.8"/>
<text x="330" y="255" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">GATE 1</text>
<text x="380" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Location</text>
<text x="380" y="300" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">realpath inside Public/</text>
<rect x="504" y="236" width="168" height="80" rx="6" fill="var(--dg-paper)"/>
<rect x="504" y="236" width="168" height="80" rx="6" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<rect x="516" y="246" width="44" height="12" rx="2" fill="none" stroke="var(--dg-accent-rule)" stroke-width="0.8"/>
<text x="538" y="255" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">GATE 2</text>
<text x="588" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Intent</text>
<text x="588" y="300" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">publish: true</text>
<rect x="704" y="240" width="144" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="704" y="240" width="144" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="716" y="250" width="44" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="738" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">MIRROR</text>
<text x="776" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">content/</text>
<text x="776" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">unpublish deletes</text>
<rect x="880" y="240" width="152" height="72" rx="6" fill="var(--dg-paper)"/>
<rect x="880" y="240" width="152" height="72" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="892" y="250" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="910" y="259" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">SITE</text>
<text x="956" y="282" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Static build</text>
<text x="956" y="298" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">Quartz · Pages</text>
<line x1="32" y1="408" x2="1048" y2="408" stroke="var(--dg-rule)" stroke-width="0.8"/>
<text x="32" y="424" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" letter-spacing="0.18em">LEGEND</text>
<rect x="32" y="440" width="14" height="10" rx="2" fill="var(--dg-accent-tint)" stroke="var(--dg-accent)" stroke-width="1"/>
<text x="52" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Gate — both must hold, independently</text>
<rect x="340" y="440" width="14" height="10" rx="2" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<text x="360" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Directory the pipeline reads or writes</text>
<line x1="648" y1="446" x2="676" y2="446" stroke="var(--dg-ink)" stroke-width="1.4" marker-end="url(#pp-arrow)"/>
<text x="684" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Permitted path</text>
<line x1="808" y1="440" x2="808" y2="450" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="800" y1="452" x2="816" y2="452" stroke="var(--dg-muted)" stroke-width="2"/>
<text x="828" y="448" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Refused — stops at the gate</text>
</svg>
<figcaption>게이트 1은 판단하기 전에 심볼릭 링크를 해석합니다. <code>Public/</code> 밖을 가리키는 링크는 따라가는 게 아니라 거절됩니다. 게이트 2는 없는 <code>publish</code> 필드를 기본값으로 채우지 않고 거절합니다. 동기화는 append가 아니라 mirror라서, <code>publish</code>를 <code>false</code>로 되돌리면 이미 나간 사본이 지워집니다.</figcaption>
</figure>

동기화가 append가 아니라 **mirror**인 것도 같은 이유입니다. `publish`를 `false`로 되돌리면 다음 동기화에서 이미 나간 사본이 저장소에서 지워집니다. 비공개로 되돌리는 동작이 아무 일도 하지 않는 것은, 하필 이 저장소에서는 가장 나쁜 동작이니까요.

여기까지는 전부 **주장**입니다. 주장을 검증으로 바꾸려고 유출 시나리오 여섯 개를 심어놓고 실제 파이프라인을 그대로 돌리는 테스트를 만들었습니다. 커리어 노트를 가리키는 진짜 심볼릭 링크, `publish` 필드가 없는 노트, 파싱되지 않는 프론트매터, 동기화를 거치지 않고 저장소에 손으로 밀어넣은 파일, 디렉터리와 어긋난 `lang`, 같은 언어에서 중복된 `translationKey`. 여섯 개 전부 거절되고, 테스트는 끝나면 볼트를 원래대로 되돌립니다. `pnpm blog:test-guard` 한 줄이면 아무 때나 다시 확인할 수 있습니다.

정적 사이트 생성기로 Quartz를 고른 이유도 여기서 나옵니다. 볼트가 이미 원본이니까, 사이트는 그걸 **복제하는 게 아니라 렌더링하기만** 하면 됩니다. 글이 있는 곳이 한 군데면 동기화 방향도 한 방향이고, 한 방향이면 게이트도 한 군데만 놓으면 됩니다.

## 노트가 늘면 다음 문제는 검색입니다

볼트에 마크다운 노트가 100개쯤 쌓였습니다. 이 정도가 되면 "그거 어디에 적었더라"가 실제 비용이 됩니다. 파일명 검색으로는 안 되고, 전문 검색으로도 잘 안 됩니다. 제가 기억하는 건 단어가 아니라 상황이기 때문입니다.

8월에 벡터 DB를 붙일지 말지를 메모로 남겨뒀습니다. 그때 결론은 "아직 아니다"였고, 대신 **뒤집을 조건 두 개**를 같이 적어뒀습니다.

- semantic 질문이 주 1회 이상 생긴다
- 노트가 아니라 **AI 세션 로그**까지 검색 대상이 된다

둘 다 발생했습니다. 그래서 만들었습니다.

조건을 미리 적어두면 좋은 점은, 나중에 자기가 **만들고 싶어서 만드는 건지 필요해서 만드는 건지**를 스스로 구분할 수 있다는 것입니다. 조건 없이 "이제 필요해진 것 같다"고 판단했다면 저는 8월에 이미 만들었을 겁니다.

## Milvus Lite, 그리고 살아남지 못한 이유 하나

그 메모에는 Chroma가 아니라 Milvus Lite를 고른 이유가 두 개 적혀 있었습니다. 코드를 다 쓰고 다시 읽어 보니 **하나는 이유가 아니었습니다.**

살아남지 못한 쪽은 이겁니다. "Chroma는 TypeScript에서 쓰려면 사실상 서버가 필요하다." 문장 자체는 사실인데, 두 후보를 **가르지 못합니다.** Milvus Lite도 Python 전용이니까요. TypeScript에서는 둘 다 임베디드로 못 쓰고, Python에서는 둘 다 임베디드로 씁니다. 같은 조건을 한쪽에만 적용해놓고 차이라고 적어둔 셈입니다.

살아남은 쪽은 **API 연속성**입니다. Milvus는 Lite → Standalone → Distributed가 같은 클라이언트 API입니다. DB를 건드리는 코드가 한 파일에 모여 있고, 그 안에서 Lite에만 해당하는 건 로컬 경로를 받는 생성자와 종료 시 서버를 내리는 호출 정도입니다. 나중에 인덱스가 커지면 URI를 `localhost:19530`으로 바꾸는 것으로 끝납니다. 다만 인덱스 타입은 안 넘어갑니다 — Lite의 `AUTOINDEX`는 사실상 전수 탐색이고, 청크 만 개에는 맞는 선택이지만 백만 개에는 틀린 선택입니다. 그때는 `HNSW`를 지정해야 합니다.

결정이 깔끔했다면 이 절은 없었을 겁니다. 근거 두 개 중 하나가 틀렸는데 결론은 그대로 유지된 경우라서, 지워두는 것보다 적어두는 쪽이 낫다고 봤습니다. 틀린 근거를 지우면 다음에 같은 착각을 또 합니다.

## 임베딩 모델은 고르지 않고 쟀습니다

여기가 실제로 시간이 든 곳입니다.

평판이나 공개 벤치마크 순위로 고르지 않고, **제 볼트로 쟀습니다.** 볼트의 실제 노트에서 손으로 만든 28개짜리 골드셋을 두고 후보 여섯 개를 같은 조건에서 돌렸습니다. 골드셋은 세 종류를 일부러 섞었습니다 — 한국어로 묻고 한국어 노트를 찾는 경우, 한국어로 묻고 영어 노트를 찾는 경우, 그리고 **영어로 묻고 한국어 노트를 찾는 경우.**

지표는 Recall@5와 MRR@10입니다.

| 모델 | R@5 | MRR@10 | 디스크 |
|---|---|---|---|
| **dragonkue/snowflake-arctic-embed-l-v2.0-ko** | **0.964** | **0.946** | 2.29 GB |
| BAAI/bge-m3 | 0.964 | 0.923 | 4.56 GB |
| jhgan/ko-sroberta-multitask *(한국어 전용)* | 0.929 | 0.857 | 0.44 GB |

bge-m3는 recall이 같습니다. 디스크는 두 배입니다. 그래서 떨어졌습니다.

흥미로운 건 한국어 전용 모델 쪽입니다. 0.929 / 0.857이면 나쁜 점수가 아닙니다. 5배 작고 7배 빠릅니다. 볼트가 대부분 한국어니까 당연히 잘할 만하고, 실제로 다국어 e5 계열보다 잘했습니다.

이 모델을 떨어뜨린 건 총점이 아니라 **방향 하나**였습니다. 영어로 물어보고 한국어 노트를 찾아야 하는 질문에서, 관련 없는 영어 글을 정답보다 위에 올렸습니다.

제 볼트는 **영어 기술 용어가 박힌 한국어 산문**이고, 저는 두 언어로 다 질문합니다. 색인된 노트 97개 중 42개가 이 블로그에 올라간 글이고, 그중 일부는 처음부터 영어로 썼습니다. 그러니까 그 방향은 있으면 좋은 게 아니라 없으면 안 되는 쪽입니다. 실패 한 건이 다국어 모델을 쓰는 이유의 전부입니다.

## 전부 이 노트북 안에서 돕니다

<figure class="diagram">
<svg viewBox="0 0 1080 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="retrieval-layer-title retrieval-layer-desc">
<title id="retrieval-layer-title">The retrieval layer, end to end on one machine</title>
<desc id="retrieval-layer-desc">Architecture diagram of a local semantic index. Vault notes and AI session transcripts are chunked, embedded by a model running on the laptop's CPU, and written to a single Milvus Lite file, which a command-line search and an MCP server read. A dashed path leaving the embedding step for a hosted API stops at the machine boundary; the only sockets opened are loopback.</desc>
<defs>
<marker id="rl-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--dg-ink)"/></marker>
</defs>
<rect width="100%" height="100%" fill="var(--dg-paper)"/>
<text x="540" y="96" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">hosted embedding API · model hub · telemetry</text>
<rect x="32" y="112" width="1016" height="232" rx="8" fill="var(--dg-zone)" stroke="var(--dg-accent)" stroke-width="1" stroke-dasharray="4,4"/>
<rect x="48" y="106" width="228" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="52" y="115" fill="var(--dg-accent)" font-size="7" font-family="var(--dg-mono)" letter-spacing="0.14em">THIS MACHINE · 0 NON-LOOPBACK SOCKETS</text>
<path d="M 200,176 H 212 Q 220,176 220,184 V 208 Q 220,216 228,216 H 256" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 200,280 H 228 Q 236,280 236,272 V 248 Q 236,240 244,240 H 256" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<line x1="408" y1="228" x2="456" y2="228" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<line x1="624" y1="228" x2="672" y2="228" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 848,216 H 856 Q 864,216 864,208 V 184 Q 864,176 872,176 H 888" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 848,240 H 864 Q 872,240 872,248 V 272 Q 872,280 880,280 H 888" fill="none" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<path d="M 540,196 V 132" fill="none" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="522" y1="128" x2="558" y2="128" stroke="var(--dg-muted)" stroke-width="2"/>
<rect x="568" y="134" width="64" height="12" rx="2" fill="var(--dg-paper)"/>
<text x="600" y="143" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">NO EGRESS</text>
<rect x="48" y="144" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="144" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="152" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="80" y="161" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">NOTES</text>
<text x="124" y="182" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Vault notes</text>
<text x="124" y="198" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">97 markdown files</text>
<rect x="48" y="248" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="48" y="248" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="60" y="256" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="78" y="265" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">LOGS</text>
<text x="124" y="286" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Session logs</text>
<text x="124" y="302" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">129 transcripts</text>
<rect x="256" y="196" width="152" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="256" y="196" width="152" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="268" y="204" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="286" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STEP</text>
<text x="332" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Chunking</text>
<text x="332" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">heading-aware</text>
<rect x="456" y="196" width="168" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="456" y="196" width="168" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="468" y="204" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="486" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STEP</text>
<text x="540" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Embedding</text>
<text x="540" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">on-disk model · CPU</text>
<rect x="672" y="196" width="176" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="672" y="196" width="176" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<rect x="684" y="204" width="40" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="704" y="213" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">STORE</text>
<text x="760" y="234" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">Milvus Lite</text>
<text x="760" y="250" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">local store · grpc 127.0.0.1</text>
<rect x="888" y="144" width="144" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="888" y="144" width="144" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="900" y="152" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="918" y="161" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">READ</text>
<text x="960" y="182" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">kb search</text>
<text x="960" y="198" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">command line</text>
<rect x="888" y="248" width="144" height="64" rx="6" fill="var(--dg-paper)"/>
<rect x="888" y="248" width="144" height="64" rx="6" fill="var(--dg-node)" stroke="var(--dg-rule-strong)" stroke-width="1"/>
<rect x="900" y="256" width="36" height="12" rx="2" fill="none" stroke="var(--dg-rule-strong)" stroke-width="0.8"/>
<text x="918" y="265" fill="var(--dg-muted)" font-size="7" font-family="var(--dg-mono)" text-anchor="middle" letter-spacing="0.08em">READ</text>
<text x="960" y="286" fill="var(--dg-ink)" font-size="12" font-weight="600" font-family="var(--dg-sans)" text-anchor="middle">MCP server</text>
<text x="960" y="302" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-mono)" text-anchor="middle">stdio · no port</text>
<line x1="32" y1="376" x2="1048" y2="376" stroke="var(--dg-rule)" stroke-width="0.8"/>
<text x="32" y="392" fill="var(--dg-muted)" font-size="8" font-family="var(--dg-mono)" letter-spacing="0.18em">LEGEND</text>
<rect x="32" y="404" width="14" height="10" rx="2" fill="var(--dg-zone)" stroke="var(--dg-accent)" stroke-width="1" stroke-dasharray="3,2"/>
<text x="52" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">The machine — nothing crosses this line</text>
<rect x="340" y="404" width="14" height="10" rx="2" fill="var(--dg-node)" stroke="var(--dg-ink)" stroke-width="1"/>
<text x="360" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Step or store</text>
<line x1="504" y1="410" x2="532" y2="410" stroke="var(--dg-ink)" stroke-width="1.2" marker-end="url(#rl-arrow)"/>
<text x="540" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Local data path</text>
<line x1="700" y1="404" x2="700" y2="414" stroke="var(--dg-muted)" stroke-width="1" stroke-dasharray="4,3"/>
<line x1="692" y1="416" x2="708" y2="416" stroke="var(--dg-muted)" stroke-width="2"/>
<text x="720" y="412" fill="var(--dg-muted)" font-size="9" font-family="var(--dg-sans)">Egress that does not happen</text>
</svg>
<figcaption>문서 226개(노트 97개 + 세션 로그 129개), 청크 10,659개. 프로세스가 여는 소켓은 클라이언트와 같은 프로세스 안의 엔진을 잇는 루프백 한 쌍뿐입니다. 콜드 빌드 39분, 아무것도 바뀌지 않은 재색인 2초.</figcaption>
</figure>

호스팅 임베딩 API는 후보에 없었습니다. 볼트에 무엇이 들어 있는지 생각하면 답이 정해져 있습니다. 임베딩은 노트북 CPU에서 돌고, 모델은 로컬 캐시에서 읽고, 인덱스는 로컬에 있고, 검색 결과를 요약해주는 LLM 호출도 없습니다. 검색 계층은 문맥을 조립해서 출력하고 거기서 멈춥니다.

문제는 이런 건 **말로 하면 아무 증거도 아니라는 점**입니다. 그래서 세 가지로 확인했습니다.

1. **소켓 트랩.** 실제 인덱싱과 실제 검색이 도는 동안 `connect`·`getaddrinfo`를 가로채서, 루프백이 아닌 주소가 나오면 예외를 던지고 어느 호스트로 가려 했는지를 찍도록 했습니다. 테스트로 남아 있어서 계속 돕니다.
2. **`lsof`.** 검색이 도는 동안 프로세스가 연 소켓을 관찰했습니다. 루프백이 아닌 소켓 0개.
3. **Wi-Fi를 끄고.** 인터페이스를 내리고 `curl`이 실패하는 걸 확인한 다음, 색인·검색·상태 조회를 전부 끝까지 돌렸습니다. 전부 정상 동작합니다.

세 번째가 가장 무식하지만 가장 확실합니다.

## 적어둔 원칙을 지켜야 했던 순간

8월 메모에 이런 줄이 있습니다.

> 벡터 DB는 재생성 가능한 인덱스다. 원본이 아니다.

쓸 때는 당연한 말이었습니다. 그런데 39분짜리 콜드 빌드를 한 번 겪고 나면 당연하지 않아집니다. 인덱스를 지우는 게 아까워지고, 아까워지는 순간 그건 인덱스가 아니라 원본처럼 다뤄지기 시작합니다.

그래서 테스트로 만들었습니다. 인덱스를 통째로 지우고, 다시 만들고, 같은 질의가 같은 상위 결과를 돌려주는지 확인합니다. 실제 볼트로도 한 번 했습니다 — 질의 세 개, 각각 상위 5개, 열다섯 건 전부 동일했습니다. 경로도 같고 점수도 소수점 셋째 자리까지 같습니다.

이제 인덱스는 언제든 지울 수 있습니다. 원본은 마크다운과 JSONL이고, 인덱스는 거기서 다시 만들어지는 물건입니다. 적어둔 원칙이 코드로 강제되기 전까지는 그냥 좋은 말입니다.

## 정리

- 볼트를 나누지 않기로 한 결정이 나머지를 거의 다 정했습니다. 게이트가 두 개인 것도, 사이트가 볼트를 렌더링만 하는 것도, 검색이 로컬인 것도 전부 거기서 따라왔습니다.
- 기본값으로 채우지 않는 쪽을 골랐습니다. 프론트매터가 없으면 거절하고, 되돌리면 지웁니다.
- 임베딩 모델은 순위표가 아니라 제 데이터로 정했습니다. 결정타는 총점이 아니라 실패 방향 하나였습니다.
- 근거 두 개 중 하나는 틀렸는데 결론은 맞았습니다. 그 사실을 지우지 않고 남겨뒀습니다.

제약이 하나면 설계는 오히려 쉬워집니다. 고를 게 줄어드니까요.
