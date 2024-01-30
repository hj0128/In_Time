# In Time

</br>

## 서비스 소개 및 개발 목적

> 작업 기간: 2023. 11 ~ 2023. 12 ( [안드로이드 앱 제작 중](https://github.com/hj0128/in_time_android) )
>
> 인력 구성: BE 1명 / FE 1명 (개인 프로젝트)
> 
> Demo: https://hyeonju.shop
> 
> API DOCS: https://hyeonju.shop/api-docs

</br>

In Time은 매번 지각쟁이들을 기다려야 하는 사용자들을 위해 제작되었습니다

</br>

약속 시간을 어기어 상대방을 기다리게 하는 지각쟁이들에게 벌금을 부과함으로써 시간을 지키도록 유도하는 것이 목표입니다.

</br>

약속 장소와 시간을 정하고 30분 전부터 멤버들 간의 위치를 서로 공유할 수 있습니다.

멤버들이 약속 장소에 다 와가는지 확인할 수 있으며, 소통을 위해 채팅 기능도 추가했습니다.

</br>

전체적인 프로젝트의 흐름을 이해하기 위해 서비스 기획부터 프론트엔드 그리고 배포까지 구현하였으며, NestJS와 테스트 작성 등 학습한 기술들의 사용 경험 및 숙련도 향상을 목표로 프로젝트를 제작하였습니다.

</br>

## 기술 스택

NestJS 10&emsp;NodeJS 18&emsp;TypeScript&emsp;MySQL&emsp;Redis&emsp;TypeORM&emsp;Docker

Git&emsp;Swagger-UI&emsp;JWT&emsp;Socket.io&emsp;Jest&emsp;Axios&emsp;Nodemailer&emsp;GCP

</br>

## ERD 설계

![in_time erd](https://github.com/hj0128/in_time/assets/112938143/382f8588-27a4-4004-96b9-92a6693915d0)

</br>

## 핵심 기능

<details>
<summary>JWT 토큰 인증 방식을 사용한 로그인</summary>
<div>

효율적인 사용자 인증과 권한 부여를 위해 JWT Token 방식으로 로그인을 구현하였습니다.

</br>

또한 더 안전하고 효율적으로 사용하기 위해 Access Token과 Refresh Token으로 구분하였습니다.

</br>

인증에 필요한 Access Token은 보안을 강화하기 위해 짧은 유효 기간을 주었으며, 갱신에 필요한 Refresh Token은 비교적 유효기간을 길게 주어 사용자 경험을 향상시키도록 하였습니다.

![로그인](https://github.com/hj0128/in_time/assets/112938143/9812d93c-f80a-4e84-a1b5-66ad73e05185)
![로그인](https://github.com/hj0128/in_time/assets/112938143/0e88406e-e148-4c37-ad45-7f4026bcee1f)
</div>
</details>

<details>
<summary>Cache Aside 패턴을 활용한 실시간 위치</summary>
<div>

유저들의 위치를 빠르게 조회하기 위해 Redis를 사용한 Cache Aside 패턴을 적용하였습니다.

</br>

Redis에 데이터가 있으면 Redis의 데이터를 반환하고, Redis에 데이터가 없으면 MySQL에서 데이터를 조회하고 Redis에 저장한 후 반환하게 됩니다.

</br>

데이터 조회 속도를 높임으로써 응답 시간이 단축되어 더 나은 사용자 경험을 느낄 수 있고, 데이터베이스에 대한 부하를 줄이는 등 성능을 향상시킬 수 있도록 하였습니다.

![약속-실시간위치](https://github.com/hj0128/in_time/assets/112938143/6942461c-8c73-4786-afc1-e5a8873e9291)
![캐시어사이드패턴](https://github.com/hj0128/in_time/assets/112938143/56928aea-385c-4c32-83c5-f0bd4b15e1ba)
</div>
</details>

<details>
<summary>트랜잭션을 활용한 벌금 처리</summary>
<div>

유저가 벌금을 내게 될 때, 유저 포인트가 파티 포인트로 보내지게 됩니다.

</br>

동일한 데이터로 User와 Party의 변경이 일어나는 것이므로, 변경 사항이 모두 일어나거나 모두 일어나지 않아야 합니다.

</br>

따라서 트랜잭션을 사용하여 데이터의 정합성을 유지하도록 하였습니다.

![약속-시간종료](https://github.com/hj0128/in_time/assets/112938143/872328b9-d203-4f25-a980-27c113e9009a)
![벌금 트랜잭션](https://github.com/hj0128/in_time/assets/112938143/e20f9a90-cbd9-4c41-9860-c2e257edd740)
</div>
</details>

<details>
<summary>Google Cloud Storage에 파일 업로드</summary>
<div>

사진 업로드 시 구글 클라우드에 업로드함으로써 사용자가 안정적이고 신속한 파일 액세스를 경험할 수 있도록 하였습니다.

![구글스토리지](https://github.com/hj0128/in_time/assets/112938143/65657b7a-4a85-4009-8738-2607c1284d74)
</div>
</details>

</br>

## 부가 기능

<details>
<summary>소셜 로그인</summary>
<div>

소셜 로그인을 통해 사용자 경험을 향상시킬 수 있도록 하였습니다.

![소셜로그인](https://github.com/hj0128/in_time/assets/112938143/413de3b0-9d6d-4f5f-a0f3-c0b6e9c0459b)
![소셜로그인1](https://github.com/hj0128/in_time/assets/112938143/570ebc76-fce7-47e3-aa69-072922de548b)
![소셜로그인2](https://github.com/hj0128/in_time/assets/112938143/bb8082d0-732a-46a8-9779-d043f9a4ae8b)
</div>
</details>

<details>
<summary>로그아웃</summary>
<div>

헤더에서 Access Token과 Refresh Token을 추출하여 유효성 검사를 하고, 만료 시간을 추출합니다.

이후 만료 시간을 사용하여 Token을 캐시에 추가합니다.

</br>

또한 인가를 할 때 쿠키에 담겨있는 Token이 캐시에 존재하는지 확인후, 존재한다면 로그아웃 상태로 간주하여 예외를 발생시킵니다.

![로그아웃](https://github.com/hj0128/in_time/assets/112938143/97b1aa96-f73c-4d31-9108-93b3e1e7fe8b)
![로그아웃](https://github.com/hj0128/in_time/assets/112938143/e58e2a0c-fd8b-414e-8de0-4531f0a361f9)
![로그아웃4](https://github.com/hj0128/in_time/assets/112938143/11a4164b-594a-45c1-84cc-c6e5f1fe1b65)
</div>
</details>

<details>
<summary>채팅</summary>
<div>

토큰을 통해 로그인 유저의 닉네임으로 메시지를 채팅방에 전송하며, 데이터베이스에 저장합니다.

</br>

또한 파티마다 채팅창이 생성되며, 파티 방이나 파티에 속한 약속 방에 들어가면 채팅 기록을 가져옵니다.
  
![채팅](https://github.com/hj0128/in_time/assets/112938143/c1a4f497-0e1b-475e-bde7-053fe4f48c18)
![채팅 받은 거 처리](https://github.com/hj0128/in_time/assets/112938143/f06be18e-8e40-4fea-b92b-af302b727d91)
![채팅 방 참여](https://github.com/hj0128/in_time/assets/112938143/515402cd-76d6-4e43-a347-e22c9c2cdf94)
</div>
</details>

<details>
<summary>약속 생성</summary>
<div>

지도에서 키워드로 장소를 검색할 수 있습니다.

</br>

이후 검색어를 입력받아 주어진 데이터를 기반으로 마커를 생성하고 지도에 표시합니다

</br>

또한 각 멤버의 포인트를 확인하고 확인이 완료되면 데이터베이스에 저장합니다.
  
![약속만들기](https://github.com/hj0128/in_time/assets/112938143/f7a814b2-5c90-4f6a-a0d2-5425109ed728)
![약속만들기5](https://github.com/hj0128/in_time/assets/112938143/ef970d90-a619-4c2f-959f-31e0a2277acf)
![약속만들기6](https://github.com/hj0128/in_time/assets/112938143/a93a0eb4-4ed2-4d3e-bbf9-a10e0b2e7ea2)
</div>
</details>

<details>
<summary>친구 맺기</summary>
<div>

닉네임으로 검색하여 친구 신청을 보낼 수 있습니다.

</br>

상대방이 친구 신청을 수락하면 친구가 되지만 거절할수도 있습니다.

</br>

또한 친구 끊기를 눌러 친구 관계인 유저와의 연결을 끊을 수 있습니다
  
![친구맺기](https://github.com/hj0128/in_time/assets/112938143/80dfd272-b094-4a34-a2b6-521f4fa96307)
![친구 거절](https://github.com/hj0128/in_time/assets/112938143/b8012fe9-e3f4-4835-8a20-0514870d7b17)
![친구 끊기](https://github.com/hj0128/in_time/assets/112938143/0ccfa264-11c6-4b9f-9e88-4f8fed647369)
![친구 수락](https://github.com/hj0128/in_time/assets/112938143/f94f4e77-eb1f-494c-ba88-a6850f3f96bc)
![친구 신청](https://github.com/hj0128/in_time/assets/112938143/14b51668-2a10-4a29-b150-21d3786f966a)
</div>
</details>

<details>
<summary>파티 생성</summary>
<div>

파티명과 멤버를 선택하면 파티가 생성됩니다.

</br>

다대다 관계인 Party와 User를 위해 각각 다대일로 구현하였으며, Party 테이블에 데이터를 저장함과 동시에 Party_User 테이블에도 데이터를 저장합니다.
  
![파티만들기](https://github.com/hj0128/in_time/assets/112938143/8e962138-0f3e-45b1-b295-683876dab8eb)
![파티7](https://github.com/hj0128/in_time/assets/112938143/5625f02f-2646-4c21-b295-913aa8827304)
</div>
</details>

<details>
<summary>마커 등록</summary>
<div>

각 파티에서는 멤버들끼리 공유할 수 있는 마커를 등록할 수 있습니다.

마커로 다음에 갈 맛집, 카페 등을 저장해둘 수 있습니다.

</br>

파티 내 지도에서 키워드로 검색 시 관련된 장소가 표시되고 등록되지 않은 장소라면 새로 저장이 됩니다.

</br>

또한, 저장된 마커를 선택하여 삭제도 할 수 있습니다.

![마커등록](https://github.com/hj0128/in_time/assets/112938143/dc3840f3-48fa-4946-86ac-34c9595462e3)
![파티 마커](https://github.com/hj0128/in_time/assets/112938143/f1e2793c-4fa0-4862-8678-d328ffe96f2d)
![파티 마커2](https://github.com/hj0128/in_time/assets/112938143/cd7337b2-90ce-42c8-9053-6d806f266464)
</div>
</details>

<details>
<summary>회원가입</summary>
<div>

회원 가입 시 프로필 사진, 이메일, 닉네임, 비밀번호를 입력해야 합니다.

이메일과 닉네임이 중복되거나 비밀번호가 일치하지 않으면 가입을 진행할 수 없습니다.

</br>

회원 가입을 위한 인증번호는 이메일로 전송되며, 3분 이내로 입력해야 합니다.

</br>

회원 가입이 완료될 시 가입 축하 이메일이 보내집니다.

</br>
</br>

이후 소셜 로그인을 통해 가입했을 때를 대비하여 허용되지 않는 문자를 정규 표현식을 사용하여 걸러내고, 필요하다면 임의의 이름을 생성합니다.

</br>

또한, 비밀번호는 해시화되어 데이터베이스에 저장됩니다.
  
![회원가입](https://github.com/hj0128/in_time/assets/112938143/4b91f644-edc4-4463-8cdd-79d1cda78267)
![회원가입8](https://github.com/hj0128/in_time/assets/112938143/09528a1e-1a88-41aa-8d66-110022aae776)
![회원가입9](https://github.com/hj0128/in_time/assets/112938143/bca82028-1b3d-43b3-8061-0e3d9e46280e)
</div>
</details>

<details>
<summary>포인트</summary>
<div>

벌금을 내기 위해 포인트를 충전할 수 있습니다.

</br>

간편한 결제와 다양한 결제 수단을 제공하기 위해 포트원을 이용하여 카카오페이와 신용카드를 구현하였습니다.

</br>

결제 후 User와 User_Point 테이블의 데이터를 변경해 주는 것으로 결제 처리를 하였습니다.
  
![포인트채우기](https://github.com/hj0128/in_time/assets/112938143/f3a38800-a230-4413-a36b-15ab76a1ab66)
![포인트 채우기](https://github.com/hj0128/in_time/assets/112938143/29440d6a-80b0-472d-bbeb-89bae9c76245)
</div>
</details>

</br>

## 트러블 슈팅

<details>
<summary>로그인</summary>
<div>

</br>

[문제 배경 1]

Access Token도 탈취 가능성이 있어 만료 기간을 짧게 설정했습니다.

그러나 토큰의 만료가 다가올 때마다 새로운 토큰을 발급하고 갱신하는 것은 사용자 경험에 부정적인 영향을 미칩니다.

</br>

[해결 방법]

Access Token과 Refresh Token을 함께 사용하여, Access Token은 짧은 유효 기간을 가지고 사용자의 요청에 대한 인증 및 권한 부여에 활용하며, Refresh Token은 보다 긴 유효 기간으로 사용자를 식별하고 새로운 Access Token을 발급하는 데 활용했습니다.

</br>

[해결 방법으로 인한 이점]

이를 통해 보안 측면에서도 안정성을 확보하면서, 동시에 사용자 경험을 향상시켰습니다.

Access Token의 짧은 유효 기간으로 인해 탈취 시 피해가 제한되며, Refresh Token을 통한 갱신 과정에서 사용자는 지속적이고 투명한 서비스 이용이 가능해졌습니다

</br>
</br>

[문제 배경 2]

Access Token을 브라우저 저장소에 보관하는 것은 XSS와 같은 공격에 노출될 수 있기에 보안상 좋지 않을 것이라고 판단했습니다.

또한, 쿠키에 보관하는 것은 CSRF와 같은 공격에 노출될 수 있기에 보안상 문제가 될 수 있습니다.

</br>

[해결 방법]

CSRF 공격은 쿠키에 저장된 Token 값을 직접적으로 탈취하는 것이 아니므로, Refresh Token은 쿠키에 안전하게 저장할 수 있다고 판단했습니다.

그러나 Access Token은 쿠키에 저장하면 CSRF 공격을 통해 인증 및 권한 부여 과정을 위조할 수 있을 우려가 있습니다.

따라서 Access Token은 변수에 저장하고, Refresh Token은 쿠키에 저장하기로 결정했습니다.

</br>

[해결 방법으로 인한 이점]

이를 통해 쿠키를 통한 CSRF 공격을 방지할 수 있고, Access Token은 변수에 저장되어 직접적인 공격이 어려우므로 보안 측면에서 안정성을 확보할 수 있게 되었습니다.

</br>

![로그인](https://github.com/hj0128/in_time/assets/112938143/3b7a284d-4d7c-463a-ad21-7f8187f2be8e)

</br>

</div>
</details>

<details>
<summary>벌금</summary>
<div>

</br>

[문제 배경]

유저가 벌금을 내게 될 때, 유저 포인트가 파티 포인트로 보내지게 됩니다.

그러나 중간에 에러가 발생하면 유저 포인트는 변경되지만 파티 포인트에는 변경 사항이 적용되지 않을 수 있습니다.

</br>

[해결 방법]

변경 사항이 모두 일어나거나 모두 일어나지 않아야 한다는 것에서 DB에 모두 반영되거나 반영되지 않아야 하는 트랜잭션의 원자성 특징을 떠올릴 수 있었습니다.

이러한 트랜잭션의 원자성 특징을 고려하여, 해당 작업을 하나의 트랜잭션으로 처리하였습니다.

이로써 유저 포인트와 파티 포인트 간의 일관성을 유지할 수 있게 되었습니다.

![벌금 트랜잭션](https://github.com/hj0128/in_time/assets/112938143/e2f4e14a-43c2-4346-a67b-cd9c73b5edf4)

</br>

[해결 방법으로 인한 이점]

이를 통해 데이터의 정합성을 보다 확실히 유지할 수 있게 되었습니다.

트랜잭션의 원자성은 작업의 일부만이 실패하더라도 전체 작업이 실패하도록 보장하여 데이터 일관성을 강화하고 예기치 않은 에러로 인한 문제를 방지할 수 있습니다.

</br>

</div>
</details>

</br>

## 테스트
<details>
<summary>유닛 테스트</summary>
<div>
  
![서비스 유닛 테스트](https://github.com/hj0128/in_time/assets/112938143/d8355c94-6693-4815-bc7b-4c60c86cf04a)
![컨트롤 유닛 테스트](https://github.com/hj0128/in_time/assets/112938143/a4f1c55f-b9e2-44d4-a544-dea1c8c65ea7)
</div>
</details>

<details>
<summary>e2e 테스트</summary>
<div>
  
![e2e 테스트](https://github.com/hj0128/in_time/assets/112938143/955740d7-0019-4539-b818-e525c0b3ef01)
</div>
</details>

</br>

테스트 도입으로 개발 생산성을 향상시켰습니다.

</br>

코드에 새로운 기능을 추가하거나 기존 코드를 수정할 때, 각각의 변경 사항이 기존 동작에 영향을 미치지 않는지 확인하는 것은 어렵고 비효율적이라 생각하였습니다.

이런 상황에서 유닛 테스트를 도입하여 모킹된 데이터를 사용해 각 코드 조각이 예상된 대로 동작하는지 확인했습니다.

이를 통해 변경 사항이 기존 기능에 영향을 주지 않으면서도 새로운 기능이나 수정된 코드가 의도한 대로 작동하는지 보장할 수 있었습니다.

</br>

또한, 유닛 테스트를 통과한 코드들을 기반으로 엔드 포인트에 대한 e2e 테스트를 수행하여 실제 HTTP 요청과 응답을 통해 시스템이 예상한 대로 동작하는지 확인했습니다.

이러한 접근 방식은 코드 리팩터링 시에도 변경된 코드가 여전히 기대한 대로 동작하는지를 간편하게 확인할 수 있게 해주어, 코드의 안정성과 신뢰성을 높일 수 있었습니다.

</br>

결과적으로 테스트 도입을 통해 코드 품질을 유지하면서도 개발 과정에서의 효율성을 향상시킬 수 있었습니다.

</br>

## 회고

NestJS, REST API, Docker, 배포 등 학습한 기술들의 사용 경험 및 숙련도 향상과 전체적인 프로젝트 흐름을 이해하는 것이 목표였습니다.

</br>

그러나 프로젝트를 기획하고 실제로 구현하는 과정에서 예상치 못한 문제에 부딪혀 어려움을 겪었습니다.

이론을 학습할 때는 자신감을 갖기 쉬웠지만, 직접 프로젝트를 구현하면서 이론만으로는 부족함을 깨달을 수 있었습니다.

이로 인해 학습한 내용이 완전히 내 것이 되려면 실제로 적용하고 경험을 많이 쌓아보아야 한다는 것을 느끼게 되었습니다.

</br>

또한 새로운 기술을 습득하는 과정에서 끊임없는 문제와 실패를 통해 해결 능력을 기를 수 있었습니다.

특히 프로젝트를 통해 배포에 대한 경험을 쌓을 수 있어 좋았습니다.

GCP를 사용하여 서버를 배포하는 과정에서 서버의 동작과 다른 사용자들의 서버 이용 과정을 경험할 수 있었습니다.

이러한 경험으로 다른 사용자들이 내가 만든 서버를 이용한다는 것에서 뿌듯함과 동시에 다시 한 번 개발의 재미를 느낄 수 있었습니다.

</br>
</br>

문제에 직면할 때는 구글링과 공식 홈페이지를 참고하면서 문제 해결 능력을 키웠습니다.

코드를 프로젝트에 바로 적용하는 것이 아닌, 디버깅을 통해 코드의 작동 원리를 깊이 이해하려고 노력했습니다.

</br>

이러한 경험을 바탕으로 기술의 원리를 깨닫고, 기술을 사용하는 이유를 고민하는 시간을 가졌습니다.

</br>

프로젝트를 처음부터 끝까지 직접 만들면서 모르던 기술을 습득하고, 긴가민가 했던 기술에 자신감이 생기고, 알고 있던 기술에 대해서는 확신을 얻는 매우 뜻깊은 시간을 보낼 수 있었습니다.

</br>

마지막으로 포트폴리오를 작성하면서 서비스의 불안정성을 느꼈습니다.

프로젝트에 애정이 있는 만큼 이후 부족한 부분을 보완하여 실제로 사용자들이 안정적으로 서비스를 이용할 수 있도록 만들고자 합니다.

</br>
