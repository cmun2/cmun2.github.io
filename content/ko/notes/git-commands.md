---
title: Git 명령어
lang: ko
translationKey: git-commands
publish: true
date: 2023-02-06
modified: 2025-04-17
tags: [git]
description: Git | Git
sourceUrl: https://cmun2.inblog.io/git-%EB%AA%85%EB%A0%B9%EC%96%B4-52592
sourceId: 52592
sourceCategory: Git
---

## **git clone**

- Git 저장소를 복제하여 로컬 시스템에 새로운 작업 복사본을 만드는 데 사용되며 원격 복사본을 만드는 데 사용되며 원격 저장소의 모든 파일, 커밋 기록, 브랜치 정보를 복사하여 로컬 디렉토리에 새로운 Git 저장소를 생성한다.

```bash
git clone <저장소 url> <디렉토리명> (복제할 원격 저장소의 url을 가져와 디렉토리명으로 저장소를 복제해온다)
-> 따로 디렉토리명을 쓰지 않을 시 기본적으로 저장소의 이름으로 디렉토리가 생성된다.
git clone git@bitbucket.org:hems-frontend-vue.git
```

## **git init**

- 새로운 Git 저장소를 초기화할 때 사용되며 현재 디렉토리를 Git 저장소로 변환하여, Git의 버전 관리 시스템을 적용할 수 있도록 한다.

```bash
git init (현재 디렉토리를 Git 저장소로 초기화)
git init my_project (my_project라는 디렉토리를 만들고, 그 안에 새로운 Git 저장소를 초기화)
```

## **git add**

- git에서 파일의 변경 사항들을 스테이징 영역(index)로 추가하는데 사용된다.(파일의 변경사항을 커밋하기 전에 준비하는 과정)

```bash
<파일을 스테이징 영역에 등록하여 관리한다>
git add <파일>

<모든 변경사항들을 스테이징한다>
git add .

<특정 패턴의 파일만 스테이징한다>
git add '*.ts'

<특정 파일의 파일만 스테이징한다>
git add -p[<파일>[<파일2> ...]]

1. 단일 파일에 대한 변경사항 스테이징 
  git add -p basicInput.vue
2. 여러 파일에 대한 변경사항 스테이징
  git add -p basicInput.vue config.ts
3. 특정 디렉토리에 대한 변경사항 스테이징
  git add -p src/

특정파일을 제외하고 올리고 싶은 부분이 있는지 확인(명령어)
git add . -- ':!web/installer/src/views/remote.vue'

하나의 파일에서 특정 라인의 변경점만 스테이징에 올리고 싶을때(명령어)
git add -p web/installer/src/views/remote.vue 를 통해 편집기를 열고 거기서 올리고 싶은 부분만
+ 또는 -를 통해서 추가/삭제하고 스테이징에 올리지 않을 부분들은 라인 앞에 #를 붙여서 skip 시킨다.
```

## **git mv**

- Git에서 파일이나 디렉토리를 이동하거나 이름을 변경하는 데 사용된다.

```bash
파일 이름 변경
git mv [현재 파일명][바꿀 파일명]
git mv web/user/src/components/button/Test.vue web/user/src/components/button/Test2.vue

파일 위치 변경
git mv [현재 위치][바꿀 위치]
git mv web/user/src/components/button/Test2.vue web/user/src/components/box/Test2.vue
```

## **git restore**

- Git에서 파일이나 작업 디렉토리를 이전 상태로 복원하는 데 사용. 이 명령어는 변경된 파일을 되돌리거나, 스테이징 영역에서 파일을 제거하는 등의 작업을 할 수 있다.

```bash
파일을 마지막으로 커밋된 상태로 되돌리기(커밋이 올려진 상태)
git restore [파일명]

모든 파일을 마지막으로 커밋된 상태로 초기화(커밋이 올려진 상태)
git restore .

특정 커밋해시로의 파일 복원
git restore --source=<커밋해시> [파일명]

스테이징 영역에 추가된 파일(즉, git add를 실행한 파일)을 다시 스테이징 해제
git restore --staged <파일명>

작업 디렉토리의 모든 파일을 이전 커밋으로 복원
git restore --source=<커밋-해시> --worktree 
```

## **git rm**

- Git에서 파일을 제거할 때 사용된다. 이 명령어는 작업 디렉토리와 스테이징 영역에서 파일을 삭제하며, 다음 커밋에 그 변경 사항을 포함시킨다.

```bash
원격 저장소와 로컬저장소의 staging area에서 파일을 내리면서 실제 파일도 삭제하게 된다.
git rm -f <파일>

원격 저장소의 파일만 삭제하고 staging area에서 파일을 내리게 된다.
git rm --cached <파일>
```

## **git bisect**

- Git에서 버그를 찾는 데 유용한 명령어로, 이진 탐색 알고리즘을 사용하여 문제를 발생시킨 커밋을 빠르게 찾는 데 도움을 준다. 버그를 유발하는 커밋을 찾기 위해, 알려진 "좋은" 커밋과 "나쁜" 커밋을 기준으로 중간 커밋을 반복적으로 테스트하여 문제를 일으킨 정확한 커밋을 찾아낸다.

```bash
커밋 이진 탐색 시작
git bisect start

좋은 상태의 커밋과 나쁜 상태의 커밋을 지정
git bisect good <커밋해시>
git bisect bad <커밋해시>

깃은 두 커밋 사이의 중간지점에 해당하는 커밋으로 체크하며 문제가 발생하는지 테스트
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[efd6c94295299eea652bb0b45b73eae285a472a3] test2
git show efd6c94295299eea652bb0b45b73eae285a472a3 를 통해 해당 커밋의 변경사항을 검사하고 
커밋 이진 탐색 종료 명령어를 통해 이진 탐색을 종료한다.
git bisect reset
```

## **git diff**

- Git에서 파일이나 커밋 간의 차이를 비교하고 그 결과를 보여주는 데 사용되며 이 명령어를 통해 변경된 내용, 수정된 코드, 커밋 간의 차이 등을 확인할 수 있다.

```bash
작업 디렉토리와 스테이징 영역간의 차이를 보여준다.
git diff
-test test2 test3 test4
+test test2 test3 test4 test5

스테이징 영역과 마지막 커밋간의 차이를 보여준다.
git diff --staged
-test test2 test3
+test test2 test3 test4

두 커밋간의 차이를 보여준다.
git diff <commit1> <commit2>

두 브랜치간의 차이를 보여준다.
git diff <branch1> <branch2>

특정 커밋에서의 변경점(해당 커밋과 그 부모 커밋간의 차이 비교) 
git diff c5a744^ c5a744

각 파일에서 얼마나 많은 줄이 추가되거나 삭제되었는지를 요약해서 보여줍니다
git diff --stat
web/user/src/components/button/Test2.vue | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
줄이 아닌 단어 단위로 비교 
git diff --word-diff
test test2 test3 test4 {+test5+}

현재 커밋과 그 이전 커밋의 차이 보기
git diff HEAD^ HEAD
```

## **grep**

- **텍스트 검색 도구이며 특정 패턴을 파일 또는 입력 스트림에서 검색하여 해당 패턴이 포함된 라인들을 출력하고 Git에서도 파일 내용 검색에 유용하게 활용할 수 있다.**

```
단순 문자열 검색(해당 파일에서 해당 문자열을 검색하고 해당 문자열이 포함된 모든 줄 출력)
grep 'test2' web/user/src/components/button/Test2.vue

대소문자 구분 없이 검색
grep -i 'storm cover' web/user/src/containers/popup/WeatherPopup.vue
출력: <div class="title">Storm Status</div>

줄 번호와 함께 검색 결과 표시
grep -n 'Storm' web/user/src/containers/popup/SevereWeatherPopup.vue
출력: 
34:        <div class="title">Storm</div>

현재 디렉토리와 모든 하위 디렉토리의 파일에서 키워드를 검색
grep -r 'storm' .

키워드와 정확히 일치하는 결과만 검색(예를들어 Storm Cover1 같은 결과는 제외)
grep -w 'Storm' web/user/src/containers/popup/WeatherPopup.vue
"Storm Cover"라는 문자열이 포함되지 않은 모든 줄을 출력
grep -v 'Storm' web/user/src/containers/popup/WeatherPopup.vue
검색된 줄의 앞뒤로 지정한 수만큼의 줄도 함께 출력
grep -C 2 'Storm' web/user/src/containers/popup/WeatherPopup.vue
출력:
<div class="tb_fm line" style="padding-top: 20px">
      <div class="weather_info_box">
        <div class="title">Storm Status</div>
        <div :class="stormData.data.stormStatus === STORM_COVER_BUTTON.OFF ? 'storm_disable' : 'storm_enable'">
          {{ stormData.data.stormStatus === STORM_COVER_BUTTON.OFF ? 'Disabled' : 'Enabled' }}
```

## **git log**

- Git에서 커밋 히스토리를 조회하고 분석하는 데 매우 유용한 명령어입니다. 다양한 옵션과 포맷을 활용하여 필요에 맞는 커밋 정보를 손쉽게 얻을 수 있다.

```bash
각 커밋을 한 줄로 요약하여 표시합니다. 커밋 해시의 앞부분과 커밋 메시지의 첫 번째 줄이 출력
git log --oneline
c5a744f13 (HEAD -> GIT_TEST_SUB) test3
efd6c9429 test2
dcb4ecb02 test commit
e9d5d640b (rc, GIT_TEST) Merged in feature/HEM-14562-installer-info-naming (pull request #3422)
d059b251b Merged in feature/HEM-14294-portal-mobile-app-link-popup (pull request #3420)
102c72940 Merged in bugfix/HEM-14553-mapper-edit-icon (pull request #3424)
28ea95547 Merged in feature/HEM-14506-apply-type-guard-to-guide-container (pull request #3402)
그래프 형태로 브랜치 구조 보기
munchang-yong@munchancBookPro frontend-vue % git log --graph
* commit c5a744f13cd9d20503efddae1b4d78187aca799c (HEAD -> GIT_TEST_SUB)
| Author: Changyong Mun <changyong.mun@naver.com>
| Date:   Tue Aug 6 03:21:59 2024 +0900
| 
|     test3
| 
* commit efd6c94295299eea652bb0b45b73eae285a472a3
| Author: Changyong Mun <changyong.mun@naver.com>
| Date:   Tue Aug 6 03:16:34 2024 +0900
| 
|     test2
| 
* commit dcb4ecb022abf60c3220cdb729a51d93a3be7ba9
| Author: Changyong Mun <changyong.mun@naver.com>
| Date:   Mon Aug 5 21:36:02 2024 +0900
| 
|     test commit
특정 파일의 히스토리 보기
git log -- web/user/src/components/button/Test2.vue
commit c5a744f13cd9d20503efddae1b4d78187aca799c (HEAD -> GIT_TEST_SUB)
Author: Changyong Mun <changyong.mun@naver.com>
Date:   Tue Aug 6 03:21:59 2024 +0900
    test3
commit efd6c94295299eea652bb0b45b73eae285a472a3
Author: Changyong Mun <changyong.mun@naver.com>
Date:   Tue Aug 6 03:16:34 2024 +0900
    test2
commit dcb4ecb022abf60c3220cdb729a51d93a3be7ba9
Author: Changyong Mun <changyong.mun@naver.com>
Date:   Mon Aug 5 21:36:02 2024 +0900
    test commit
git log --author="Changyong Mun" (특정 작성자의 커밋만 보기)
커밋된 코드 변경 내용에서 특정 단어가 포함된 커밋을 검색
git log -S 'bugfix'
```

## **git show**

- Git에서 커밋이나 다른 참조의 상세 정보를 확인하는 데 유용합니다. 커밋의 변경 사항, 로그 메시지, 파일 상태 등을 쉽게 파악할 수 있어, 코드 변경 이력을 추적하고 이해하는 데 도움을 준다.

```bash
git show(현재 체크아웃된 HEAD의 커밋 내용 출력)
출력 -> 
commit c5a744f13cd9d20503efddae1b4d78187aca799c (HEAD -> GIT_TEST_SUB)
Author: Changyong Mun <changyong.mun@qcells.com>
Date:   Tue Aug 6 03:21:59 2024 +0900
    test3
diff --git a/web/user/src/components/button/Test2.vue b/web/user/src/components/button/Test2.vue
index c51516a71..3d43a5e0e 100644
--- a/web/user/src/components/button/Test2.vue
+++ b/web/user/src/components/button/Test2.vue
@@ -1 +1 @@
-test test2
+test test2 test3
git show 커밋해시(커밋 해시에 해당하는 커밋의 상세 내용을 출력)
git show 브랜치(브랜치의 마지막 커밋 보기)
git show rc
출력:
commit e9d5d640b834045a40edfd2fb8e9a4a3d8c6a49e (rc, GIT_TEST)
Author: Chang Yong Mun <changyong.mun@naver.com>
Date:   Mon Aug 5 06:37:19 2024 +0000
    Merged in feature/TEST-1-naming (pull request #3422)
    [Task] installer info naming
    * fix(admin): fix installer_info naming
    Approved-by: author1
    Approved-by: author2
    Approved-by: author3
    Approved-by: author4
git show 커밋해시:파일이름 (커밋해시에서 파일이름의 파일 변경 내용을 확인)
스태시보기(stash@{0}는 가장 최근의 스태시 항목을 의미)
git show stash@{0}
출력:
commit 1ee46f80448f9b6202e9bd8c9637f20158e46541 (refs/stash)
Merge: 349302aec 45df9035f
Author: Changyong Mun <changyong.mun@naver.com>
Date:   Mon Aug 5 16:43:41 2024 +0900
    On feature/TEST-2-add-management-details: WIP on feature/TEST-2-add-management-details
```

## **git status**

- Git에서 작업 디렉토리와 스테이징 영역의 상태를 확인하는 데 사용되며 현재 브랜치의 상태, 변경된 파일, 스테이징된 파일, 커밋되지 않은 변경 사항 등을 보여준다.

```bash
git status (현재 작업중인 디렉토리의 브랜치의 이름정보, 스테이징된 변경사항, 스테이징 되지 않은 변경사항등을 볼 수 있다)

출력:
On branch GIT_TEST_SUB
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   web/user/src/components/button/Test2.vue
git status -s (간단한 형식으로 현재 작업중인 디렉토리 상태 확인)
M(수정된 파일) A(추가된 파일)로 표현한다.
git status --ignored (.gitignore 파일에 의해 무시된 파일도 포함하여 상태를 보여준다)
git status --no-branch (현재 브랜치 정보를 출력하지 않고 변경사항만 보여준다)
```

## **git branch**

- Git에서 브랜치를 관리, 브랜치 목록 조회, 새로운 브랜치 생성, 삭제 또는 이름을 변경하는데 사용

```bash
git branch (현재 저장소의 모든 로컬 브랜치를 나열하고 체크아웃된 브랜치는 별표(*)로 표시된다.)
git branch <새로운 브랜치명> (지정한 이름으로 새로운 브랜치를 생성하지만, 생성된 브랜치로 전환하지는 않는다)
git checkout -b <새로운 브랜치명> (지정한 이름으로 새로운 브랜치를 생성하고 생성된 브랜치로 바로 전환한다)
git branch -m <새로운 브랜치명> (현재 체크아웃된 브랜치의 이름을 변경)
git branch -m <기존 브랜치명> <새로운 브랜치명> (특정 브랜치의 이름을 변경)
git branch -d <브랜치명> (병합된 브랜치를 삭제)
git branch -D <브랜치명> (브랜치가 아직 병합되지 않았다면 강제로 삭제)
git branch -r (원격 브랜치 목록 보기)
git branch -a (로컬 및 원격 브랜치 목록 모두 보기)
```

## **git commit**

- 변경된 파일을 버전관리 시스템에 저장하는데 사용된다. 커밋은 프로젝트의 상태를 기록하며 각 커밋은 고유한 해시값을 가지게 된다.

```bash
<Staging 된 모든 파일을 커밋한다. 이후 현재 Branch가 새 커밋을 가리키게 한다>
git commit -m "<메세지>"

<스테이징된 파일 중에서 파일명의 변경사항만 커밋한다>
git commit <파일명>

<스테이징 되지 않은 변경사항도 자동으로 스테이징하고 커밋하게 된다>
git commit -m "<메세지>" -a

<최근 커밋(제일 마지막)의 메세지를 재작성할 수 있다>
git commit -m "<메세지>" --amend
출력:
[GIT_TEST_SUB 986197c10] test for amend
 Date: Tue Aug 6 16:21:07 2024 +0900
 1 file changed, 1 insertion(+), 1 deletion(-)

<이전 커밋을 수정하고 커밋 메시지를 재사용할 수 있게되어 커밋 메세지는 변경되지 않는다.>
git commit -C HEAD --amend
git add를 통해 새로운 파일을 스테이징하고 해당명령어를 사용하면 커밋메세지를 그대로 재사용하며 변경사항을 추가하게 된다.
```

## **git merge**

- **Git에서 두 개의 브랜치를 병합하여 하나의 브랜치로 통합하는 데 사용**

```bash
<현재 체크아웃된 브랜치에 지정한 브랜치를 병합>
git merge <브랜치>
출력: 
Updating 067f832cc..01991a0f9
Fast-forward
 web/user/src/components/button/Test2.vue | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
git merge origin <브랜치>
<브랜치의 모든 커밋을 하나의 커밋으로 스쿼시하여 병합>
git merge --squash <브랜치>
// 병합 중 충돌날시에는 충돌을 해결한 후, 변경 사항을 스테이징하고 커밋하여 병합을 완료한다.
```

## **git rebase**

- 브랜치의 기반점을 변경하여 브랜치를 합치는 작업을 수행한다. 현재 브랜치를 기준으로 다른 브랜치에서 변경된 커밋을 가져와 현재 브랜치 위에 새로운 커밋으로 적용하며 충돌이 발생한 경우 해결하여 커밋 기록을 단순화한다.

```bash
<현재 브랜치를 리베이스할 브랜치의 최신 커밋위로 재배치한다>
// 위의 git pull --rebase origin main과 다른점은 별도로 git fetch를 사용하여 리베이스할 브랜치의 최신 변경사항을 가져와야 한다.
git rebase <브랜치>
<리베이스 도중 충돌이 발생하면 git은 충돌을 해결하라고 요청하며 충돌을 해결한 후 리베이스를 계속 진행한다>
git add <파일> -> 충돌해결한 부분
git rebase --continue -> 리베이스를 계속 진행
<충돌 해결을 포기하고 리베이스를 중단한다>
git rebase --abort
<리베이스 도중 특정 커밋을 건너뛰고 리베이스를 계속 진행한다>
git rebase --skip
```

## **git reset**

- Git에서 커밋 히스토리를 변경하거나 로컬 변경 사항을 조정하는 데 사용

```bash
//git reset이 유용한 경우
1. 최근 커밋을 취소하고 다시 수정하여 올바르게 커밋하고 싶을 때(--soft)
2. git add로 추가한 파일을 스테이징 영역에서 제거하고 싶을 때(일반)
3. 현재 브랜치를 특정 커밋 상태로 되돌리고 모든 변경 사항을 제거하고 싶을 때.(--hard)
<커밋만 취소하고, 변경 사항은 작업 디렉토리와 스테이지에 그대로 유지>
git reset --soft <커밋해시>
git reset --soft HEAD~1 (마지막 커밋을 제거하고 해당 커밋의 변경사항을 스테이징 영역에 남겨둔다)
<커밋과 스테이지를 취소하지만, 작업 디렉토리의 변경 사항은 그대로 유지합니다>
git reset <커밋해시>
//git reset <파일> (스테이징된 파일을 언스테이징)
< 커밋, 스테이지, 작업 디렉토리 모두를 지정한 커밋 상태로 되돌립니다. 변경 사항이 모두 삭제되며 복구할 수 없다>
git reset --hard <커밋해시>
--hard 옵션을 사용할 시 되돌린 커밋과 작업 디렉토리의 변경사항이 모두 삭제되기에 필요한 파일이 있는지 확인 후 사용
```

## **git switch**

- git에서 브랜치를 전환하거나 새로운 브랜치를 생성하고 전환할 때 사용

```bash
git switch <브랜치명> (기존에 있던 브랜치명으로 브랜치 전환)
출력:
Switched to branch 'GIT_TEST_SUB'
git switch -c <새로운 브랜치명> (새로운 브랜치 생성 후 전환)
특징: git switch는 브랜치 전환과 관련된 작업에 특화되어 있으며 git checkout은 브랜치 전환 외에도 파일을 특정 시점으로 되돌리는 등의 기능이 있어 
브랜치 전환을 할때는 git switch를 쓰는 것이 좋다.
```

## **git tag**

- **git에서 특정 커밋을 참조하는 태그를 생성, 관리하는데 사용 (태그 = 소프트웨어의 릴리스 버전이나 중요한 지점을 표시할 때 사용)**

* **경량 태그(lightweight tag)**

  - 단순히 특정 커밋을 가리키는 포인터로 개발 중 빠르게 태그를 생성할 때 사용

* **주석 태그(annotation tag)**

  - 작성자, 날짜, 메세지, 서명 등을 포함하는 태그로 릴리스 버전 태그로 자주 사용되며 서명을 추가할 수 있어서 보안적으로 중요한 태그에 적합\\

  ```bash
git tag <태그명> (경량 태그 생성)
git tag -a <태그명> -m "태그 메세지" (주석 태그 생성)
git push origin <태그명> (특정 태그를 원격 저장소에 푸시)
git push --tags (로컬 저장소의 모든 태그를 원격 저장소에 푸시)
git tag (저장소의 모든 태그 나열)
git tag -l "test.*" (test로 시작 하는 모든 태그 표시)
git tag -d <태그명> (로컬 저장소에서 태그 삭제)
git push origin --delete <태그명> (원격 저장소에서 태그 삭제)
```

## **git fetch**

- 원격 저장소에서 최신 변경 사항을 로컬 저장소로 가져오지만 현재 작업중인 브랜치에 직접적으로 변경사항을 병합시키지는 않는다. 브랜치간의 차이를 비교하고 필요시 병합이나 리베이스를 할 수 있는 준비를 한다.

```bash
git fetch origin <원격저장소 브랜치이름> (원격 저장소에서의 로컬저장소로 최신변경사항을 가져온다)
<원격 저장소에서 삭제된 브랜치를 로컬 브랜치에서도 삭제한다>
// Repo에서 특정 브랜치에 Feature를 만들고나서 main과 머지하고 나서 삭제를 하더라도 Local에서는 해당 브랜치가 존재하는 상황에 유용하게 쓰인다
git fetch --prune
<remote에 존재하는 브랜치들을 가져오게한다>
git remote update
```

## **git pull**

- **원격 저장소의 변경 사항을 가져와서 현재 브랜치에 병합(merge)하는데 사용된다. 병합 도중 충돌이 발생할 수도 있기 때문에 충돌작업을 해결하기 위해 추가작업이 필요할 수 있다.(=git fetch후 머지하는것, 종종 merge commit을 생성하여 머지를 진행한다)**

```bash
git pull origin <원격저장소 브랜치이름> (원격저장소에서 로컬저장소로 소스를 가져오기)
//ex: git pull origin rc
<pull 작업을 하기 전에 자동으로 로컬에서의 임시저장(stash)를 실행하고 다른 branch에서의 pull 작업이 끝난 후 stash를 복원한다>
// 기본적으로 병합(merge)을 사용하여 변경사항을 통합한다. 
// 커밋 히스토리를 유지하고 싶을때 유용하다.
git pull --autostash origin main
<원격 저장소의 commit 이력이 로컬 저장소로 합쳐지고 로컬 저장소의 변경 사항은 재반영된다>
// commit 이력을 한줄로 깔끔하게 관리할 수 있으며 모든 커밋을 직선형으로 유지하고 싶을 때 유용하며 협업 시 다른 사람의 변경사항을 먼저 적용후
// 자신의 변경사항을 적용하여 충돌을 최소화 하고 싶을 때 사용한다. 
// 순서: 원격 저장소의 브랜치에서 최신 변경 사항 가져오기 -> 현재 브랜치의 커밋 임시저장 -> 원격 저장소의 변경사항 현재 브랜치에 적용 -> 임시로 저장된 현재 브랜치의 커밋 다시 적용
// 재배치 과정에서 충돌하면 git은 충돌하면 충돌을 해결하도록 요청하며 충돌을 해결하면 git rebase --continue로 재배치를 계속 진행한다.
git pull --rebase origin main
```

## **git push**

- **로컬 저장소의 커밋을 원격 저장소에 업로드하는 데 사용되며 로컬 브랜치의 변경 사항을 원격 브랜치에 반영하여 다른 사용자와 변경 사항을 공유할 수 있게 한다.**

```bash
<특정 브랜치로 변경사항을 푸시할 때 -> commit올린것 push>
git push <원격저장소 이름> <푸시할 브랜치명>
출력: 
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 12 threads
Compressing objects: 100% (7/7), done.
Writing objects: 100% (8/8), 591 bytes | 591.00 KiB/s, done.
Total 8 (delta 6), reused 0 (delta 0), pack-reused 0 (from 0)
remote: 
remote: Create pull request for GIT_TEST_SUB:
remote:   https://bitbucket.org/gelibitbucket/qcells-hems-frontend-vue/pull-requests/new?source=GIT_TEST_SUB&t=1
remote: 
To https://bitbucket.org/frontend-vue.git
 * [new branch]          GIT_TEST_SUB -> GIT_TEST_SUB
git push origin <원격저장소 브랜치> (특정 로컬 브랜치를 원격 브랜치로 푸시)
git push origin --delete <원격저장소 브랜치> (해당 브랜치를 원격 브랜치에서 삭제한다.)
```

## **git revert**

- 커밋 히스토리를 보존하면서 커밋을 취소할 수 있는 안전한 방법이며 `git reset`과 달리 히스토리를 변경하지 않기 때문에 협업 환경에서 유용하게 사용된다.

```bash
// git revert가 유용한경우
1. 원격 저장소에 푸시된 커밋을 취소하고 싶을 때.
2. 커밋 히스토리를 유지하면서 변경 사항을 취소하고 싶을 때
<새 커밋을 생성한 후 특정 커밋의 변경사항을 되돌리며 되돌린 커밋의 메세지를 사용한다>
git revert <커밋해시>
//ex) git revert a1b2c3d
<되돌린 커밋의 메세지를 수정할때>
// 위와 동일하며 커밋 메세지를 수정할 수 있는 편집기를 연다.
git revert -e <커밋해시>
<다수의 커밋 리버트>
// 2개 이상의 커밋을 선택하여 리버트할 때 사용한다
git revert -n a1b2c3d e4f5g6h
<merge가 완료된 상태에서 revert>
// 예시) rc 기준 브랜치를 만들고 commit을 날리고 rc와 병합한 상태에서 해당 브랜치의 커밋들을 리버트 하고 싶을 때
git revert {현재 커밋 해시} -m {되돌릴 부모 번호}
<여러 커밋 일괄 리버트>
// 예시) 되돌리기 시작할 커밋 해시 부터 순서대로 되돌아갈 커밋 해시까지의 커밋들을 리버트 하고 싶을 때
git revert 되돌아갈 커밋 해시..되돌리기 시작할 커밋 해시 
```

## **git cherry-pick**

- Git에서 특정 커밋을 현재 브랜치에 적용할 때 사용된다. 이 명령어는 원본 브랜치에서 특정 커밋의 변경 사항만을 현재 브랜치에 복사해오는 데 유용하다.

```bash
<현재 브랜치에 커밋 해시의 변경사항 적용>
git cherry-pick <커밋해시>
<커밋 범위를 사용하여 여러 커밋을 한번에 cherry-pick 적용>
git cherry-pick <시작 커밋 해시>..<종료 커밋 해시>
<커밋 해시의 변경 사항을 현재 브랜치에 적용하되, 자동으로 커밋하지 않게 해준다>
git cherry-pick -n <커밋해시>
```
