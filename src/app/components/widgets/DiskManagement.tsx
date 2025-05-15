import React, { useState, useEffect, useRef } from "react";
import { getAuthHeaders } from '../../utils/auth';
import '../../styles/DiskManagementStyle.css';

interface DiskUsageData {
  available: string;
  filesystem: string;
  mounted_on: string;
  size: string;
  use_percent: string;
  used: string;
}

interface DeleteResponse {
  message: string;
  status: string;
  details?: any;
  task_id?: string;
}

interface CleanupConfig {
  retention_period: number; // 보존 기간 (년)
  last_cleanup_date: string; // 마지막 정리 날짜 (YYYY-MM-DD)
  auto_cleanup: boolean; // 자동 정리 활성화 여부
}

export default function DiskManagement() {
    const [diskData, setDiskData] = useState<DiskUsageData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeletingFiles, setIsDeletingFiles] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [executionLog, setExecutionLog] = useState<string>('');
    const [config, setConfig] = useState<CleanupConfig>({
        retention_period: 2,
        last_cleanup_date: '',
        auto_cleanup: true
    });
    const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
    const [tempRetentionPeriod, setTempRetentionPeriod] = useState<number>(2);
    const configLoaded = useRef<boolean>(false);

    // 파일 시스템 API 호출 - 설정 파일 로드
    const loadConfig = async () => {
        try {
            addLog("설정 불러오는 중...");
            
            // 로컬 스토리지에서 설정 불러오기
            const savedConfig = localStorage.getItem('disk_cleanup_config');
            
            if (savedConfig) {
                try {
                    const loadedConfig = JSON.parse(savedConfig);
                    setConfig(loadedConfig);
                    setTempRetentionPeriod(loadedConfig.retention_period);
                    addLog(`설정 로드 완료: 보존기간 ${loadedConfig.retention_period}년, 마지막 정리일 ${loadedConfig.last_cleanup_date || '없음'}`);
                } catch (error) {
                    console.error("설정 파싱 오류:", error);
                    addLog("설정 파싱 오류. 기본 설정 사용");
                    // 기본 설정 저장
                    await saveConfig();
                }
            } else {
                addLog("설정이 없습니다. 기본 설정 사용");
                // 기본 설정 저장
                await saveConfig();
            }
            
            configLoaded.current = true;
        } catch (error) {
            console.error("설정 로드 오류:", error);
            addLog(`설정 로드 오류: ${(error as Error).message}`);
            await saveConfig();
        }
    };

        // 설정 파일 저장
        const saveConfig = async () => {
        try {
            addLog("설정 저장 중...");
            
            // 로컬 스토리지에 설정 저장
            localStorage.setItem('disk_cleanup_config', JSON.stringify(config));
            
            addLog("설정 저장 완료");
            return true;
        } catch (error) {
            console.error("설정 저장 오류:", error);
            addLog(`설정 저장 오류: ${(error as Error).message}`);
            return false;
        }
    };

    // 로그 파일 저장
    const saveLog = async (targetDate: string) => {
        try {
            // 로그 데이터 생성
            const logData = {
                date: new Date().toISOString(),
                target_date: targetDate,
                status: 'completed',
                task_id: taskId
            };
            
            // 로컬 스토리지에 로그 저장
            localStorage.setItem('disk_cleanup_log', JSON.stringify(logData));
            
            // 설정 파일의 마지막 정리 날짜 업데이트
            const updatedConfig = {
                ...config,
                last_cleanup_date: targetDate
            };
            setConfig(updatedConfig);
            
            // 업데이트된 설정 저장
            localStorage.setItem('disk_cleanup_config', JSON.stringify(updatedConfig));
            
            addLog(`로그 저장 완료. 마지막 정리일: ${targetDate}`);
            return true;
        } catch (error) {
            console.error("로그 저장 오류:", error);
            addLog(`로그 저장 오류: ${(error as Error).message}`);
            return false;
        }
    };

    // 현재 날짜로부터 X년 전 날짜 계산
    const getDateFromYearsAgo = (years: number) => {
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setFullYear(today.getFullYear() - years);
        
        // YYYY-MM-DD 형식으로 반환
        return pastDate.toISOString().split('T')[0];
    };

    // 날짜 형식화 함수 (로깅용)
    const formatDate = (date: Date) => {
        return date.toLocaleString('ko-KR');
    };

    // 로그 추가 함수
    const addLog = (message: string) => {
        const now = new Date();
        setExecutionLog(prev => `[${formatDate(now)}] ${message}\n${prev}`);
    };

    // 정리가 필요한지 확인하는 함수
    const isCleanupNeeded = () => {
        // 마지막 정리 날짜가 없으면 정리 필요
        if (!config.last_cleanup_date) {
            return true;
        }
        
        // 설정된 보존 기간에 따른 타겟 날짜
        const targetDate = getDateFromYearsAgo(config.retention_period);
        
        // 마지막 정리 날짜가 타겟 날짜보다 이전이면 정리 필요
        return targetDate !== config.last_cleanup_date;
    };

    // 파일 삭제 테스트 함수
    const testFileDelete = async (date: string) => {
        try {
            addLog("파일 삭제 테스트 시작...");
            
            const response = await fetch('/api/sync-file-cleaner/delete-by-date', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    start_date: date,
                    end_date: date
                })
            });

            const data: DeleteResponse = await response.json();
            
            addLog(`테스트 응답: ${data.status} - ${data.message}`);
            
            // 테스트 삭제 성공했으면 true 반환
            return data.status === 'success';
        } catch (err) {
            const errorMsg = (err as Error).message || '파일 삭제 테스트 실패';
            addLog(`오류: ${errorMsg}`);
            console.error('파일 삭제 테스트 오류:', err);
            return false;
        }
    };

    // 실제 파일 삭제 실행 함수
    const executeFileDelete = async (date: string) => {
        try {
            setIsDeletingFiles(true);
            addLog("파일 삭제 작업 실행 중...");
            
            const response = await fetch('/api/sync-file-cleaner/delete-by-date', {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    start_date: date,
                    end_date: date
                })
            });

            const data: DeleteResponse = await response.json();
            
            if (data.status === 'accepted' && data.task_id) {
                setTaskId(data.task_id);
                addLog(`삭제 작업 시작됨. 작업 ID: ${data.task_id}`);
                
                // 로그 파일 저장
                await saveLog(date);
                
                return true;
            } else {
                addLog(`삭제 작업 실패: ${data.message}`);
                return false;
            }
        } catch (err) {
            const errorMsg = (err as Error).message || '파일 삭제 작업 실행 실패';
            addLog(`오류: ${errorMsg}`);
            console.error('파일 삭제 작업 오류:', err);
            return false;
        } finally {
            setIsDeletingFiles(false);
        }
    };

    // 자동 파일 정리 프로세스
    const runAutoCleanup = async () => {
        // 자동 정리 비활성화된 경우 스킵
        if (!config.auto_cleanup) {
            addLog("자동 정리가 비활성화되어 있습니다.");
            return;
        }
        
        // 정리가 필요한지 확인
        if (!isCleanupNeeded()) {
            addLog(`이미 오늘(${config.last_cleanup_date}) 정리가 실행되었습니다.`);
            return;
        }
        
        // 보존 기간에 따른 날짜 계산
        const cleanupDate = getDateFromYearsAgo(config.retention_period);
        
        addLog(`정리 대상 날짜: ${cleanupDate} (보존기간: ${config.retention_period}년)`);
        
        // 테스트 삭제 실행
        const testResult = await testFileDelete(cleanupDate);
        
        // 테스트 성공시에만 실제 삭제 진행
        if (testResult) {
            await executeFileDelete(cleanupDate);
        } else {
            addLog("테스트 삭제 실패로 인한 작업 중단");
        }
    };

    // 디스크 사용량 정보를 가져오는 함수
    const fetchDiskUsage = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // API 호출
            const response = await fetch('/api/disk-info/disk-usage', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                setDiskData(data.data);
                setLastUpdated(data.timestamp || new Date().toLocaleString('ko-KR'));
                addLog(`디스크 정보 업데이트 완료. 사용량: ${data.data.use_percent}`);
            } else {
                throw new Error('디스크 정보를 가져오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('디스크 사용량 데이터 로드 오류:', err);
            setError((err as Error).message || '디스크 정보를 불러올 수 없습니다.');
            addLog(`디스크 정보 로드 오류: ${(err as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 설정 변경 저장 함수
    const saveConfigChanges = async () => {
        const updatedConfig = {
            ...config,
            retention_period: tempRetentionPeriod
        };
        
        setConfig(updatedConfig);
        setIsConfigModalOpen(false);
        
        addLog(`보존 기간 변경: ${config.retention_period}년 → ${tempRetentionPeriod}년`);
        
        // 설정 파일 저장
        await fetch('/api/file-system/write-file', {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: 'logs/cleanup_config.json',
                content: JSON.stringify(updatedConfig, null, 2)
            })
        });
    };

    // 컴포넌트 마운트 시 데이터 로드 및 설정 로드
    useEffect(() => {
        const init = async () => {
            // 설정 파일 로드
            await loadConfig();
            
            // 디스크 정보 로드
            await fetchDiskUsage();
            
            // 설정이 로드되었고 자동 정리가 활성화된 경우에만 자동 정리 실행
            if (configLoaded.current && config.auto_cleanup) {
                runAutoCleanup();
            }
        };
        
        init();
    }, []);

    // 새로고침 버튼 클릭 핸들러
    const handleRefresh = () => {
        fetchDiskUsage();
    };

    // 수동 정리 버튼 클릭 핸들러
    const handleManualCleanup = () => {
        runAutoCleanup();
    };
    
    // 보존 기간 클릭 핸들러
    const handleRetentionPeriodClick = () => {
        setTempRetentionPeriod(config.retention_period);
        setIsConfigModalOpen(true);
    };

    return (
        <div className="disk-management-container">
            {/* 보존 기간 설정 모달 */}
            {isConfigModalOpen && (
                <div className="disk-management-modal-overlay">
                    <div className="disk-management-modal">
                        <div className="disk-management-modal-header">
                            <span>보존 기간 설정</span>
                            <button 
                                className="disk-management-modal-close" 
                                onClick={() => setIsConfigModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="disk-management-modal-body">
                            <div className="disk-management-modal-input-group">
                                <label>보존 기간 (년)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="10" 
                                    value={tempRetentionPeriod} 
                                    onChange={(e) => setTempRetentionPeriod(parseInt(e.target.value) || 1)}
                                    className="disk-management-modal-input"
                                />
                            </div>
                            <div className="disk-management-modal-info">
                                설정한 기간보다 오래된 파일은 자동으로 정리됩니다.
                            </div>
                        </div>
                        <div className="disk-management-modal-footer">
                            <button 
                                className="disk-management-modal-cancel" 
                                onClick={() => setIsConfigModalOpen(false)}
                            >
                                취소
                            </button>
                            <button 
                                className="disk-management-modal-save" 
                                onClick={saveConfigChanges}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="disk-management-title">
                <div className="disk-management-title-text">
                    <span>서버 용량 관리</span>
                    <div 
                        className={`refresh-icon ${isLoading ? 'refreshing' : ''}`}
                        onClick={handleRefresh}
                        title="정보 새로고침"
                    >
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M23 4v6h-6"></path>
                            <path d="M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Row 1: IP Address */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label">
                    <span>아이피</span>
                </div>
                <div className="disk-management-cell-content">
                    <span>211.110.139.189</span>
                </div>
            </div>

            {/* Row 2: Total and Remaining Capacity */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label">
                    <span>전체용량</span>
                </div>
                <div className="disk-management-cell-content-small">
                    <span>{diskData ? diskData.size : '-'}</span>
                </div>
                <div className="disk-management-cell-label-second">
                    <span>남은용량</span>
                </div>
                <div className="disk-management-cell-content-small-second">
                    <span>{diskData ? diskData.available : '-'}</span>
                </div>
            </div>

            {/* Row 3: Retention Period and System Status */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label">
                    <span>보존기간</span>
                </div>
                <div 
                    className="disk-management-cell-content-small clickable"
                    onClick={handleRetentionPeriodClick}
                    title="보존 기간 설정 변경"
                >
                    <span>{config.retention_period}년</span>
                </div>
                <div className="disk-management-cell-label-second">
                    <span>시스템 상태</span>
                </div>
                <div className="disk-management-cell-content-small-second">
                    <div className={`status-running ${isDeletingFiles ? 'blinking' : ''}`}>
                        {isDeletingFiles ? '정리중' : '실행중'}
                    </div>
                </div>
            </div>

            {/* Row 4: Execution History Label & Button */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label-full">
                    <span>실행기록</span>
                </div>
                <div 
                    className="disk-management-cleanup-button"
                    onClick={handleManualCleanup}
                    title="파일 정리 실행"
                >
                    <span>정리시작</span>
                </div>
            </div>

            {/* Multi-line content area for execution history */}
            <div className="disk-management-multi-content">
                <div className="disk-management-multi-content-inner">
                    {error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <pre className="execution-log">{executionLog || '[2025-03-25] 삭제실행 [2025-03-25] 1,300파일 삭제 성공'}</pre>
                    )}
                </div>
            </div>
        </div>
    );
}