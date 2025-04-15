import { ethers } from 'ethers';

export interface NetworkProvider {
    connect(rpcUrl: string): Promise<void>;
    deploy(abi: any[], bytecode: string, signer: ethers.Signer, ...args: any[]): Promise<ethers.Contract>;
    verify(address: string, constructorArgs: any[]): Promise<{ url: string }>;
    getNetworkProvider(rpcUrl: string): Promise<ethers.providers.Provider>;
}

export class NetworkProviderService implements NetworkProvider {
    private provider!: ethers.providers.Provider;

    async connect(rpcUrl: string): Promise<void> {
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }

    async deploy(abi: any[], bytecode: string, signer: ethers.Signer, ...args: any[]): Promise<ethers.Contract> {
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(...args);
        await contract.deployed();
        return contract;
    }

    async verify(address: string, constructorArgs: any[]): Promise<{ url: string }> {
        return {
            url: `https://etherscan.io/address/${address}#code`
        };
    }

    async getNetworkProvider(rpcUrl: string): Promise<ethers.providers.Provider> {
        return new ethers.providers.JsonRpcProvider(rpcUrl);
    }
}