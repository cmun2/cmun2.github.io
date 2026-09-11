---
title: 네트워크 요청(SSE)
lang: ko
translationKey: network-sse
publish: true
date: 2024-08-16
modified: 2025-04-17
tags: [javascript, networking]
description: SSE | Javascript, SSE
sourceUrl: https://cmun2.inblog.io/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%9A%94%EC%B2%ADsse-52576
sourceId: 52576
sourceCategory: Javascript
---

- [Server-Sent Events](https://html.spec.whatwg.org/multipage/comms.html#the-eventsource-interface) 사양에서는 서버와의 연결을 유지하고 서버로부터 이벤트를 수신할 수 있는 기본 제공 클래스 `EventSource`에 대해 기술하고 있다.

- 웹소켓과 마찬가지로 연결은 영구적이지만 몇 가지 중요한 차이가 있다.

- |                             |                   |
  | --------------------------- | ----------------- |
  | WebSocket                   | EventSource       |
  | 양방향: 클라이언트와 서버 모두 메시지 교환 가능 | 단방향: 서버만 데이터를 전송함 |
  | 이진 데이터나 텍스트 데이터             | 텍스트               |
  | 웹소켓 프로토콜                    | 일반적인 HTTP         |

* `EventSource`는 웹소켓보다는 덜 강력한 방식이다.

* 다만, 더 간단하고 많은 애플리케이션에서 `WebSocket`의 성능은 약간 과하다고 여겨지므로 이 방법을 사용한다.

* 채팅 메시지나 시장 가격 등 서버로부터 데이터 스트림을 수신해야 하는 경우 `EventSource`를 사용하면 좋다. 또한, `WebSocket`의 경우 재연결을 수동으로 해야하지만 `EventSource`를 사용할 경우 자동 재연결 기능을 지원한다. 새로운 프로토콜이 아니며 일반적인 HTTP를 기반으로 한다.

### Getting messages

- 메시지 수신을 시작하려면 `new EventSource(url)`을 생성하면 된다.

- 브라우저는 url에 연결하고 연결을 열어둔 상태로 이벤트를 기다린다.

- 서버는 상태 값 200 및 Content-Type: text/event-stream 헤더로 응답 후 연결을 유지하고 다음과 같은 포맷으로 메시지를 작성해야 한다.

```
data: Message 1

data: Message 2

data: Message 3
data: of two lines
```

- 메시지는 `data:` 뒤에 오는데 콜론 뒤의 공백은 선택 사항이다.

- 메시지는 이중 줄바꿈 `\\n\\n`으로 구분된다.

- 줄 바꿈 \n을 보내면 즉시 `data:` 를 하나 더 보낼 수 있다.

- 일반적으로 복잡한 메시지는 JSON으로 인코딩되어 전송되므로 줄바꿈은 그 안에서 \n으로 인코딩된다. 따라서 여러 줄의 `data:` 메시지는 필요하지 않다. 따라서 하나의 data: 에는 하나의 메시지가 저장된다고 가정할 수 있고 각 메시지에 대해 메시지 이벤트가 생성된다.

```javascript
data: {"user":"John","message":"First line\n Second line"}

let eventSource = new EventSource("/events/subscribe");

eventSource.onmessage = function(event) {
  console.log("New message", event.data);
  // will log 3 times for the data stream above
};

// or eventSource.addEventListener('message', ...)
```

### Cross-origin requests

- EventSource는 다른 네트워킹 메서드에서 fetch하는 것과 같이 교차 출처 요청을 지원하기에 모든 URL을 사용할 수 있다.

```javascript
let source = new EventSource("https://another-site.com/events");
```

- 원격 서버는 Origin 헤더를 가져오고 계속 진행하려면 Access-Control-Allow-Origin으로 응답해야 한다.

- 자격 증명을 전달하려면 다음과 같이 withCredentials 옵션을 설정해야 한다.

```javascript
let source = new EventSource("https://another-site.com/events", {
  withCredentials: true
});
```

### Reconnection

- 생성 시 `new EventSource`가 서버에 연결하고 연결이 끊어지면 다시 연결한다.

- 재연결 사이에는 기본적으로 몇 초 정도의 지연이 있다.

- 서버는 `retry:` 응답 시간(밀리초)을 사용하여 권장 지연을 설정할 수 있다.

```
retry: 15000
data: Hello, I set the reconnection delay to 15 seconds
```

- `retry:` 시 메시지는 일부 데이터와 함께 표시되거나 독립적인 메시지로 표시될 수 있다.

- 브라우저는 다시 연결하기 전에 해당 밀리초를 기다려야 하고 또는 더 오래 기다릴 수도 있다. 예를 들어, 브라우저가 현재 네트워크에 연결되어 있지 않음을 알고 있는 경우(OS에서) 연결이 될 때까지 기다린 후 재시도할 수 있다.

- 서버가 브라우저의 재접속을 중지하려면 HTTP 상태 204로 응답하면 된다.

- 브라우저가 연결을 닫으려면 `eventSource.close()`를 호출한다.

- 응답의 콘텐츠 유형이 잘못되었거나 HTTP 상태가 301, 307, 200, 204가 아닌 경우 다시 연결되지 않는다. 이 경우 ‘오류’ 이벤트가 발생하고 브라우저가 다시 연결하지 않는다.

### Message id

- 네트워크 문제로 연결이 끊어지면 어느 쪽이든 어떤 메시지가 수신되었고 수신되지 않았는지 확인할 수 없다.

- 연결을 제대로 재개하려면 각 메시지에 id 필드가 있어야 한다.

```
data: Message 1
id: 1

data: Message 2
id: 2

data: Message 3
data: of two lines
id: 3
```

- id: 가 수신되면 브라우저는 eventSource.lastEventId 속성 값을 해당 값으로 설정한다. 재접속 시 서버가 다음 메시지를 전송할 수 있도록 Last-Event-ID 헤더에 해당 id를 전송한다.

  ⚠️

  id: 는 data: 뒤에 넣는다. 서버에서는 메시지 데이터 아래에 id를 추가함으로써 클라이언트가 메시지 수신 후에 lastEventId가 업데이트 될 수 있도록 한다.

### Connection status: readyState

- `EventSource` 객체는 다음의 세 가지 값 중 하나를 readyState 속성으로 갖는다.

```
EventSource.CONNECTING = 0; // connecting or reconnecting
EventSource.OPEN = 1;       // connected
EventSource.CLOSED = 2;     // connection closed
```

- 객체가 생성되거나 연결이 끊어지면 항상 `EventSource.CONNECTING`(0과 같음)이 된다.

- 이 속성을 통해 `EventSource`의 상태를 알 수 있다.

### Event Types

- 기본적으로 `EventSource` 객체는 세가지 이벤트를 생성한다.

  - `message`: 메시지를 수신하여, [event.data](http://event.data)를 사용할 수 있다.

  - `open`: 연결이 열려 있음을 받는다.

  - `error`: 연결을 재개할 수 없음(예. 서버가 HTTP 500 상태를 반환하는 경우)

- 서버는 이벤트 시작 시 `event: …` 를 사용하여 다른 유형의 이벤트를 지정할 수 있다.

```
event: join
data: Bob

data: Hello

event: leave
data: Bob
```

- 사용자 지정 이벤트를 처리하려면 onmessage가 아니라 addEventListener를 사용해야 한다.

```
eventSource.addEventListener('join', event => {
  alert(`Joined ${event.data}`);
});

eventSource.addEventListener('message', event => {
  alert(`Said: ${event.data}`);
});

eventSource.addEventListener('leave', event => {
  alert(`Left ${event.data}`);
});
```

### Full example

- <https://ko.javascript.info/article/server-sent-events/eventsource/>

  - 서버는 1, 2, 3 메시지를 보낸 후 bye 메시지를 보내고 연결을 종료한다.

  - 브라우저는 자동으로 재연결한다.

### 실제 적용: HEMS에서의 Energy Flow

```typescript
const state = reactive({
	...
	sse: null as unknown as EventSource,
	...
});

const getEventFlowData = () => {
	checkConnection().then(async (status) => {
		state.disconnect = !status;
	  if (status) {
	    const authToken = await getRealtimeApiAuthToken();
      if (Helper.isNull(authToken)) return;
		    state.sse = new EventSource(`${realtime_url}/${state.baseDeviceInfo.site_id}`, {
			    withCredentials: true,
          headers: {
            'X-AUTH-TOKEN': authToken,
          },
	      });
      state.sse.onopen = function () {
		    state.realtimeStatus = true;
		    getRealtimeMonitoringData();
	    };
    }
	});
};

const getRealtimeMonitoringData = () => {
	state.sse.onmessage = function (evt: MessageEvent) {
	  const data = evt.data;
    if (Helper.isJSON(data)) {
	    const monitoringData = JSON.parse(data);
      let d = monitoringData.monitoring_data as RealtimeMonitoringInfo;
      state.data = d;
    }
  };
  state.sse.onerror = function (e: MessageEvent) {
	  console.error(e);
    state.realtimeStatus = false;
  };
};

onBeforeUnmount(() => {
	state.sse?.close();
	...
});
```
