// Internal imports
import config from '#root/config';


// Local imports
import EthToolset from './EthToolset';
import { IToolset, SetupParams } from './ToolsetBase';
import MaticToolset from './MaticToolset';


class ToolsetFactory {
  static async createToolsetAsync({ networkLabel, logLevel, connectToNetwork }: SetupParams): Promise<IToolset> {
    if (config.ethereumNetworkLabels.includes(networkLabel)) {
      const ethToolset = new EthToolset();
      await ethToolset.setupAsync({ networkLabel, logLevel, connectToNetwork });
      return ethToolset;
    } else if (config.polygonNetworkLabels.includes(networkLabel)) {
      const maticToolset = new MaticToolset();
      await maticToolset.setupAsync({ networkLabel, logLevel, connectToNetwork });
      return maticToolset;
    } else {
      throw new Error(`Unsupported networkLabel: ${networkLabel}`);
    }
  }
}


export default ToolsetFactory;

