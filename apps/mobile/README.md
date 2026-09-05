# GeoCredit mobile client

`src/api.ts` is the mobile workflow client. It is intentionally UI-framework neutral so it can be used from Expo/React Native screens.

The working screen is `App.tsx`. Start it with `npm.cmd run start --workspace @geocredit/mobile`. For a physical device, set `EXPO_PUBLIC_API_BASE_URL` to an API address reachable from that device; `localhost` points to the device itself.

The CDO screen should call these methods in order:

1. `login`
2. `createDabiDraft`
3. `uploadEvidence` with the camera/file `Blob`
4. `verifyGeo` with the device GPS reading
5. `getAreaIntelligence`
6. `saveFinancialAssessment`
7. `submit`

The client sends the server-provided `If-Match` version on every mutating application request and uploads media directly to the private MinIO presigned URL.
