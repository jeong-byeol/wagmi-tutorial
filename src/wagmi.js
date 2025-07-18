import { http, createConfig } from 'wagmi';
import { kairos } from 'wagmi/chains';
import { injected, metaMask, safe } from 'wagmi/connectors';

export const config = createConfig({
  chains: [kairos], // 지원할 체인 목록 (메인넷, 세폴리아 테스트넷)
  connectors: [
    injected(), // 브라우저 주입 지갑 (메타마스크 등)
    metaMask(),
    safe(),
  ],
  transports: {
    [kairos.id]: http(), // 세폴리아 테스트넷도 기본 public RPC 사용
  },
});