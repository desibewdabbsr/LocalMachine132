import { BaseCommand } from '../base-command';
import { NetworkService } from '../../services/network/network-service';
import * as vscode from 'vscode';

type NetworkType = 'mainnet' | 'testnet' | 'local';

export class VerifyCommand extends BaseCommand {
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
        return this.showProgress('Verifying Smart Contract', async () => {
            const network = await vscode.window.showQuickPick(
                ['mainnet', 'testnet', 'local'] as NetworkType[], 
                { placeHolder: 'Select network for verification' }
            ) as NetworkType;
            
            if (!network) {
                throw new Error('Network selection cancelled');
            }
            
            await this.networkService.connect(this.getNetworkUrl(network));
            const verificationResult = await this.networkService.verify(
                contractInfo.address,
                contractInfo.constructorArguments
            );
            
            vscode.window.showInformationMessage(
                `Contract verified successfully: ${verificationResult.url}`
            );
        });
    }

    private getNetworkUrl(network: NetworkType): string {
        return this.networks[network] || this.networks.local;
    }
}



// npm run test:suite -- tests/suite/commands/contract/verify-command.test.ts