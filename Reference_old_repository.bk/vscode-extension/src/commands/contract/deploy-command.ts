import { BaseCommand } from '../base-command';
import { NetworkService } from '../../services/network/network-service';
import * as vscode from 'vscode';

type NetworkType = 'mainnet' | 'testnet' | 'local';

export class DeployCommand extends BaseCommand {
    private networkService: NetworkService;
    private networks: Record<NetworkType, string> = {
        mainnet: 'https://mainnet.infura.io/v3/your-project-id',
        testnet: 'https://testnet.infura.io/v3/your-project-id',
        local: 'http://localhost:8545'
    };

    constructor(context: vscode.ExtensionContext) {
        super(context);
        this.networkService = new NetworkService();
    }

    async execute(contractInfo: any): Promise<void> {
        return this.showProgress('Deploying Smart Contract', async () => {
            const network = await vscode.window.showQuickPick(
                ['mainnet', 'testnet', 'local'] as NetworkType[], 
                { placeHolder: 'Select deployment network' }
            ) as NetworkType;
            
            if (!network) {
                throw new Error('Network selection cancelled');
            }
            
            await this.networkService.connect(this.getNetworkUrl(network));
            const deployedContract = await this.networkService.deploy(
                contractInfo.abi,
                contractInfo.bytecode,
                contractInfo.signer
            );
            
            vscode.window.showInformationMessage(
                `Contract deployed at: ${deployedContract.address}`
            );
        });
    }

    private getNetworkUrl(network: NetworkType): string {
        return this.networks[network] || this.networks.local;
    }
}


// npm run test:suite -- tests/suite/commands/contract/deploy-command.test.ts

/*
run local hardhat node before running this test

cd hardhat-project
npx hardhat node

Make sure to replace 'your-project-id' with your actual Infura project ID.
    test('should deploy contract successfully', async () => {

*/