# In Time

</br>

## 소개

In Time은 서로의 위치를 공유하여 정해진 약속 시간 내에 약속 장소에 도착하는지 확인할 수 있는 실시간 위치 기반 서비스입니다.

약속을 지키지 않는 사람들에게서 지각비를 거두어, 시간을 낭비하게 되는 사람들에게 작은 보상을 줄 수 있습니다.

- 제작 기간: 2023년 11월 3일 ~ 2023년 12월 20일 ( [안드로이드 앱 제작 중](https://github.com/hj0128/in_time_android) )
- 참여 인원: 개인 프로젝트
- 데모 사이트: https://hyeonju.shop
- API DOCS: https://hyeonju.shop/api-docs

</br>

## 기술 스택

NestJS 10&emsp;NodeJS 18&emsp;Express&emsp;TypeScript&emsp;TypeORM&emsp;MySQL2&emsp;Redis&emsp;Docker-compose&emsp;

Jest&emsp;Jsonwebtoken&emsp;Passport&emsp;Socket.io&emsp;Axios&emsp;Swagger-UI&emsp;Nodemailer&emsp;Git&emsp;GitHub&emsp;GCP

</br>

## ERD 설계

![in_time erd](https://github.com/hj0128/in_time/assets/112938143/382f8588-27a4-4004-96b9-92a6693915d0)

</br>

## 핵심 기능

<details>
<summary>JWT 토큰 인증 방식을 사용한 로그인</summary>
<div>

JWT 토큰을 Access Token으로 하는 인증 인가 서비스를 구현하였습니다.

이때 Access Token이 탈취되면 토큰이 만료되기 전까지 토큰을 획득한 사람은 권한 접근이 가능해지기 때문에 토큰의 유효 기간을 짧게 설정하였습니다.

또한, 짧은 유효 기간 때문에 자주 로그인해야 하는 사용자의 불편함을 해결하기 위해 Refresh Token이라는 추가적인 토큰을 활용하여 토큰을 이중 장막 쳐서 보다 보안을 강화하였습니다.

![로그인](https://github.com/hj0128/in_time/assets/112938143/0e88406e-e148-4c37-ad45-7f4026bcee1f)
</div>
</details>

<details>
<summary>Cache Aside 패턴을 활용한 위치 저장</summary>
<div>

유저들의 위치를 빠르게 조회하기 위해 Redis를 사용한 Cache Aside 패턴을 적용하였습니다.

이로써 Redis에 데이터가 있으면 Redis의 데이터를 바로 반환하고, Redis에 데이터가 없으면 MySQL에서 데이터를 조회하고 Redis에 저장한 후 반환하게 됩니다.

![캐시어사이드패턴](https://github.com/hj0128/in_time/assets/112938143/56928aea-385c-4c32-83c5-f0bd4b15e1ba)
</div>
</details>

<details>
<summary>geolocation을 이용한 실시간 위치 가져오기</summary>
<div>

geolocation을 이용하여 사용자의 실시간 위치를 가져옵니다.

사용자의 위치가 목적지 50m 이내라면, 위치 정보 수집을 중단하고 목적지에 도착했음을 저장합니다.

반면 사용자의 위치가 목적지 50m 밖이라면, 목적지에 아직 도착하지 못했음을 저장합니다.

![실시간위치](https://github.com/hj0128/in_time/assets/112938143/532f84ba-8f59-42ff-9af0-d79513a9c805)
</div>
</details>

<details>
<summary>트랜잭션을 활용한 포인트 처리</summary>
<div>

동일한 데이터로 User와 Party의 변경이 일어나는 것이므로, 변경 사항이 모두 일어나거나 모두 일어나지 않아야 하기 때문에 트랜잭션을 사용하여 데이터의 정합성을 유지할 수 있습니다.

![벌금 트랜잭션](https://github.com/hj0128/in_time/assets/112938143/e20f9a90-cbd9-4c41-9860-c2e257edd740)
</div>
</details>

<details>
<summary>Google Cloud Storage 업로드</summary>
<div>

프로필 사진 업로드 시 Google Cloud Platform의 Cloud Storage로 업로드되어 보관됩니다.

![구글스토리지](https://github.com/hj0128/in_time/assets/112938143/65657b7a-4a85-4009-8738-2607c1284d74)
</div>
</details>

</br>

## 부가 기능

<details>
<summary>소셜 로그인</summary>
<div>

![소셜로그인](https://github.com/hj0128/in_time/assets/112938143/413de3b0-9d6d-4f5f-a0f3-c0b6e9c0459b)
</div>
</details>

<details>
<summary>실시간 위치</summary>
<div>

![약속-실시간위치](https://github.com/hj0128/in_time/assets/112938143/4af988b3-6c69-4932-aa6c-758a793089e6)
</div>
</details>

<details>
<summary>벌금 걷기</summary>
<div>

![약속-시간종료](https://github.com/hj0128/in_time/assets/112938143/a4afe444-f78a-47fd-8142-921a257d0f58)
</div>
</details>

<details>
<summary>채팅</summary>
<div>
  
![채팅](https://github.com/hj0128/in_time/assets/112938143/c1a4f497-0e1b-475e-bde7-053fe4f48c18)
</div>
</details>

<details>
<summary>약속 생성</summary>
<div>
  
![약속만들기](https://github.com/hj0128/in_time/assets/112938143/f7a814b2-5c90-4f6a-a0d2-5425109ed728)
</div>
</details>

<details>
<summary>친구 맺기</summary>
<div>
  
![친구맺기](https://github.com/hj0128/in_time/assets/112938143/80dfd272-b094-4a34-a2b6-521f4fa96307)
</div>
</details>

<details>
<summary>파티 생성</summary>
<div>
  
![파티만들기](https://github.com/hj0128/in_time/assets/112938143/8e962138-0f3e-45b1-b295-683876dab8eb)
</div>
</details>

<details>
<summary>회원가입</summary>
<div>
  
![회원가입](https://github.com/hj0128/in_time/assets/112938143/4b91f644-edc4-4463-8cdd-79d1cda78267)
</div>
</details>

<details>
<summary>포인트 채우기</summary>
<div>
  
![포인트채우기](https://github.com/hj0128/in_time/assets/112938143/f3a38800-a230-4413-a36b-15ab76a1ab66)
</div>
</details>

</br>

## 트러블 슈팅

<details>
<summary>트랜잭션</summary>
<div>
</br>

(이슈)

포인트 채우기 요청을 처리하던 중 에러가 발생하게 되어 User와 User_Point의 데이터가 각각 일치하지 않게 되어 데이터 정합성이 훼손되게 됩니다.

전달받은 금액에 대하여 User의 point도 값이 변경되어야 하고, User_Point 테이블에도 데이터가 생성되어야 합니다.

</br>

이때, 데이터의 정합성을 유지하기 위해 트랜잭션을 적용할 수 있었습니다.

</br>

(해결)

![트랜잭션2](https://github.com/hj0128/in_time/assets/112938143/e91c631b-e957-410d-8d31-a1ef2f87e1ca)

User의 값만 변경되어서도 안되고 User_Point 테이블에만 값이 생성되어서도 안된다는 것에서 DB에 모두 반영되거나 모두 반영되지 않아야 하는 트랜잭션의 원자성 특징을 떠올릴 수 있었습니다.

이로써 트랜잭션이 성공함과 실패함에 따라 commit과 rollback을 통해 데이터의 정합성을 유지할 수 있게 되었습니다.

</br>

</div>
</details>

<details>
<summary>api 요청 시 인가를 위한 처리</summary>
<div>
</br>

(이슈)

인가를 위해 api 요청 시 헤더에 토큰을 담는 로직이 반복 작성되는 것을 발견하였습니다.

</br>

동일한 로직을 매번 작성하는 것은 비효율적이라 생각하였고, 이러한 반복적인 작업을 줄이기 위해 axios의 Interceptors를 적용할 수 있었습니다.

</br>

(해결)

![로그인 인가](https://github.com/hj0128/in_time/assets/112938143/4a92a43a-d44c-4a55-9c81-154e1a2da3c8)

Interceptors를 적용하여 401 에러를 받으면 액세스 토큰을 재발급 받아 헤더에 액세스 토큰을 담는 과정을 한곳에서 처리하게 되어 중복 코드를 제거하고 유지 보수성을 향상시킬 수 있게 되었습니다.

또한, 401 에러를 받은 요청을 다시 재시작하여 사용자 입장에서는 에러가 발생한 지 모르도록 처리하였습니다.

</br>

</div>
</details>

<details>
<summary>http get 파라미터</summary>
<div>
</br>

(이슈)

회원 가입을 할 때 name 값이 처음 요청했던 값으로 고정되어서 name 값을 변경하더라도 변경되지 않은 채 서버로 넘어오는 것을 발견하였습니다.

![http get 요청 시 초기 값 전달2](https://github.com/hj0128/in_time/assets/112938143/a437f3e4-344b-4f89-b93f-307489855c96)

get 요청은 데이터를 쿼리 스트링을 통해 전송하기 때문에, 값을 파라미터에 담기 위해 params를 사용할 수 있었습니다.

</br>

(해결)

![http get 요청 시 초기 값 전달3](https://github.com/hj0128/in_time/assets/112938143/77c73b89-fec8-4c21-8921-c75e30090799)

이로써 파라미터를 URL에 포함 시켜 새로운 값을 전달하므로 매번 새로운 값을 전달할 수 있게 되었습니다.

</br>

</div>
</details>

<details>
<summary>라이브러리 버전 충돌</summary>
<div>
</br>

(이슈)

Docker를 통해 서버를 실행하던 중 strip-ansi 라이브러리에서 에러가 발생하였습니다.

![string-width 라이브러리 버전문제1](https://github.com/hj0128/in_time/assets/112938143/ad184f62-d28f-4491-ad26-5aad706ee572)

yarn.lock 파일을 확인해 본 결과, strip-ansi와 함께 사용되는 string-width 라이브러리의 버전 충돌 문제임을 발견하였습니다.

또한, string-width 라이브러리는 다른 라이브러리 내에 설치된 라이브러리이기 때문에 package.json에서 의존성들의 특정 버전을 지정할 수 있는 옵션을 사용하여 직접 설정해 줄 수 있었습니다.

</br>

(해결)

![string-width 라이브러리 버전문제2](https://github.com/hj0128/in_time/assets/112938143/3f52986c-2dbb-402e-bf6c-c83187c8f598)

package.json 파일의 resolutions 옵션을 사용하여 하위 라이브러리에서 설치하고 있는 string-width 라이브러리의 버전을 명시하여 버전 충돌을 해결할 수 있었습니다.

</br>

</div>
</details>

</br>

## 회고/느낀 점

- 새로운 경험으로 느낀 개발의 재미

  프로젝트를 하면서 새로운 기술에 대해 접해 볼 수 있었고, 그중 프로젝트 전에는 잘 와닿지 않았던 배포에 대해 GCP로 직접 서버 배포를 하며 간단하게나마 어떤 식으로 배포가 되는지 알 수 있게 되었습니다.
  
  배포를 통해 다른 사람들이 내가 만든 서버를 이용할 수 있다는 것에서 뿌듯함과 동시에 다시 한번 개발에 대한 재미를 느낄 수 있었습니다.

- 아는 것만으로는 충분하지 않다. 적용해야 한다.

  새로운 기술에 대해 공부를 하고 프로젝트를 시작하였으나 막상 직접 적용하려 하니 어려움이 많았습니다.
  
  학습한 것이 나의 것이라 착각할 수 있었지만 완전한 나의 것이 아니었음을 알 수 있었고, 직접 부딪혀봄으로 이론만 배울 때와는 달리 더 넓고 깊은 이해를 할 수 있었습니다.
  
  이로 인해 공부만 하는 것에서 멈추는 것이 아닌 직접 적용하여 나의 것으로 만들어야 한다는 것을 다시 한번 느낄 수 있었습니다.
