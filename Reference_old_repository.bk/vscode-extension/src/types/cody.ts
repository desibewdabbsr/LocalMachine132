export interface ContractSpec {
    type: 'erc20' | 'erc721' | 'defi';
    name?: string;
    symbol?: string;
    features?: string[];
    protocol?: string;
}

export interface GeneratedContract {
    code: string;
    analysis: {
        security: SecurityAnalysis;
        defi?: DefiAnalysis;
        quality_score: number;
    };
    metadata: ContractMetadata;
}





export interface ContractMetadata {
    version: string;
    generated_at: string;
    optimizer_settings?: string;
}








export interface CodyRequest {
    message: string;
    timestamp: string;
    context?: {
        contractPath?: string;
        features?: string[];
        type?: 'contract' | 'security' | 'defi' | 'general';
    };
}

export interface CodyResponse {
    type: 'contract' | 'security' | 'defi' | 'general';
    result?: {
        code?: string;
        analysis?: SecurityAnalysis | DefiAnalysis;
        suggestions?: string[];
    };
    response?: any;
    timestamp: string;
    error?: string;
}

interface SecurityAnalysis {
    vulnerabilities: string[];
    riskLevel: string;
    recommendations: string[];
}

interface DefiAnalysis {
    protocolRisks: string[];
    integrationPoints: string[];
    economicModel: any;
}
