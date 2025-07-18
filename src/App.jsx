import { useAccount, useConnect, useDisconnect, useBalance, useSendTransaction } from 'wagmi';
import { formatEther, parseEther } from 'ethers';
import { useState } from 'react';
import React from 'react'; // Added missing import for React

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: account.address,
  });
  
  // 개발자 지갑 주소 (후원받을 주소)
  const DEVELOPER_ADDRESS = "0xb128FC43C07eBE66976f22CB736f166205C1CFa7";
  
  // 후원 관련 상태
  const [tipAmount, setTipAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');
  
  const { sendTransaction, isPending, error: sendError, data: hash } = useSendTransaction();

  // 지갑 주소를 축약형으로 표시하는 함수
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 사용 가능한 지갑 목록을 표시하는 함수
  const handleConnect = (connector) => {
    connect({ connector });
  };

  // 후원 전송 함수
  const handleSendTip = async () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      setTxError('유효한 금액을 입력해주세요.');
      return;
    }

    setIsSending(true);
    setTxError('');
    setTxHash('');

    try {
      sendTransaction({
        to: DEVELOPER_ADDRESS,
        value: parseEther(tipAmount),
      });
    } catch (error) {
      setTxError(error.message || '전송 중 오류가 발생했습니다.');
      setIsSending(false);
    }
  };

  // 트랜잭션 데이터가 변경될 때 해시 업데이트
  React.useEffect(() => {
    if (hash) {
      setTxHash(hash);
      setIsSending(false);
    }
  }, [hash]);

  return (
    <>
      <div>
        <h2>계정 정보</h2>
        <p>상태: {account.status}</p>
        {account.status === 'connected' && account.address && (
          <p>주소: {shortenAddress(account.address)}</p>
        )}
        <p>체인 ID: {account.chainId}</p>
        {error && <p style={{ color: 'red' }}>에러: {error.message}</p>}
      </div>
      <div>
        {account.status !== 'connected' && (
          <div>
            <h3>지갑 연결하기</h3>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                type="button"
                onClick={() => handleConnect(connector)}
                disabled={status === 'pending'}
                style={{ margin: '5px', padding: '10px 15px' }}
              >
                {connector.name} 연결
              </button>
            ))}
            {status === 'pending' && <p>연결 중...</p>}
          </div>
        )}
        {account.status === 'connected' && (
          <div>
            <p>연결된 지갑: {shortenAddress(account.address)}</p>
            <button type="button" onClick={() => disconnect()}>
              연결 해제
            </button>
          </div>
        )}
      </div>
      <div>
        <h4>프로필 정보</h4>
        {account.status === 'connected' && (
          <div>
            <h5>내 지갑 주소</h5>
            <p style={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
              {account.address}
            </p>
            <h5>현재 잔액</h5>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
              {balance ? `${formatEther(balance.value)} ${balance.symbol}` : '로딩 중...'}
            </p>
          </div>
        )}
      </div>
      <div>
        <h4>후원하기</h4>
        {account.status === 'connected' ? (
          <div style={{ maxWidth: '400px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <p><strong>개발자 주소:</strong> {shortenAddress(DEVELOPER_ADDRESS)}</p>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="tipAmount" style={{ display: 'block', marginBottom: '5px' }}>
                후원할 ETH 금액:
              </label>
              <input
                id="tipAmount"
                type="number"
                step="0.001"
                min="0.001"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="0.01"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                disabled={isPending}
              />
            </div>
            <button
              onClick={handleSendTip}
              disabled={isPending || !tipAmount || parseFloat(tipAmount) <= 0}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isPending ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {isPending ? '전송 중...' : '팁 보내기'}
            </button>
            
            {txHash && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                <p style={{ color: '#155724', margin: 0 }}>
                  <strong>전송 성공!</strong>
                </p>
                <p style={{ color: '#155724', margin: '5px 0 0 0', fontSize: '14px' }}>
                  트랜잭션 해시: {txHash}
                </p>
              </div>
            )}
            
            {(txError || sendError) && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                <p style={{ color: '#721c24', margin: 0 }}>
                  <strong>오류:</strong> {txError || sendError?.message}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p>후원을 위해 지갑을 먼저 연결해주세요.</p>
        )}
      </div>
    </>
  );
}

export default App;