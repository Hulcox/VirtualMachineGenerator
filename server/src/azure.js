import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import { DefaultAzureCredential } from "@azure/identity";
import { ResourceManagementClient } from "@azure/arm-resources";
import { ComputeManagementClient } from "@azure/arm-compute";
import { NetworkManagementClient } from "@azure/arm-network";
import { StorageManagementClient } from "@azure/arm-storage";
import { DateTime } from "luxon";

export const StartAndStopAzureVm = (publisher, offer, sku) => {
  /* Azure information to link azure account and be able to generate VM */

  const location = "francecentral";
  const accType = "Standard_LRS";
  const AdminVmUser = "AstroCloudAdmin";
  const AdminVmPassword = "AstroCloud%SDV//";

  const AzureClientId = process.env.AZURE_CLIENT_ID;
  const AzureTenantId = process.env.AZURE_TENANT_ID;
  const AzureSecretId = process.env.AZURE_CLIENT_SECRET;
  const AzureSubscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

  if (
    !AzureClientId ||
    !AzureTenantId ||
    !AzureSecretId ||
    !AzureSubscriptionId
  ) {
    // if Azure Information are missing return 500 by the request
    throw new Error("Azure information are missing");
  }

  const credantials = new DefaultAzureCredential();

  const resource = new ResourceManagementClient(
    credantials,
    AzureSubscriptionId
  );
  const compute = new ComputeManagementClient(credantials, AzureSubscriptionId);
  const storage = new StorageManagementClient(credantials, AzureSubscriptionId);
  const network = new NetworkManagementClient(credantials, AzureSubscriptionId);

  /* generate randomId for don't have the same id in azure resources group*/

  let resourceGroupId = generateId("resource");
  let vmId = generateId("vm");
  let storageAccountId = generateId("storage");
  let vnetId = generateId("vnet");
  let subnetId = generateId("subnet");
  let publicIpId = generateId("public-ip");
  let networkInterfaceId = generateId("network");
  let ipConfigId = generateId("ip-config");
  let domainId = generateId("domain");
  let osDiskId = generateId("os-disk");

  // generate resource group, storage, network interface and after virtual machine

  const createVirtualMachine = async () => {
    try {
      await createResource();
      await createStorage();
      const networkInfo = await createNetWork();
      const vmImage = await findVmImage();

      const vmConfiguration = {
        location: location,
        osProfile: {
          computerName: vmId,
          adminUsername: AdminVmUser,
          adminPassword: AdminVmPassword,
        },
        hardwareProfile: {
          vmSize: "Standard_B1ls",
        },
        storageProfile: {
          imageReference: {
            publisher: publisher,
            offer: offer,
            sku: sku,
            version: vmImage[0].name,
          },
          osDisk: {
            name: osDiskId,
            caching: "None",
            createOption: "fromImage",
            vhd: {
              uri:
                "https://" +
                storageAccountId +
                ".blob.core.windows.net/nodejscontainer/osnodejslinux.vhd",
            },
          },
        },
        networkProfile: {
          networkInterfaces: [
            {
              id: networkInfo.id,
              primary: true,
            },
          ],
        },
      };

      return await compute.virtualMachines.beginCreateOrUpdateAndWait(
        resourceGroupId,
        vmId,
        vmConfiguration
      );
    } catch (error) {
      throw new Error(error.message);
    }
  };
  // fonction to generate resource group
  const createResource = async () => {
    await resource.resourceGroups.createOrUpdate(resourceGroupId, {
      location: location,
      tags: { sampletag: "sampleValue" },
    });
  };
  // fonction to generate rstorage
  const createStorage = async () => {
    await storage.storageAccounts.beginCreateAndWait(
      resourceGroupId,
      storageAccountId,
      {
        location: location,
        sku: {
          name: accType,
        },
        kind: "Storage",
        tags: {
          sampletag: "sampleValue",
        },
      }
    );
  };
  // fonction to generate network interface
  const createNetWork = async () => {
    await network.virtualNetworks.beginCreateOrUpdateAndWait(
      resourceGroupId,
      vnetId,
      {
        location: location,
        addressSpace: {
          addressPrefixes: ["10.0.0.0/16"],
        },
        dhcpOptions: {
          dnsServers: ["10.1.1.1", "10.1.2.4"],
        },
        subnets: [{ name: subnetId, addressPrefix: "10.0.0.0/24" }],
      }
    );

    const subnetInfo = await network.subnets.get(
      resourceGroupId,
      vnetId,
      subnetId
    );

    const publicIpInfo =
      await network.publicIPAddresses.beginCreateOrUpdateAndWait(
        resourceGroupId,
        publicIpId,
        {
          location: location,
          publicIPAllocationMethod: "Dynamic",
          dnsSettings: {
            domainNameLabel: domainId,
          },
        }
      );

    return await network.networkInterfaces.beginCreateOrUpdateAndWait(
      resourceGroupId,
      networkInterfaceId,
      {
        location: location,
        ipConfigurations: [
          {
            name: ipConfigId,
            privateIPAllocationMethod: "Dynamic",
            subnet: subnetInfo,
            publicIPAddress: publicIpInfo,
          },
        ],
      }
    );
  };

  const findVmImage = async () => {
    return await compute.virtualMachineImages.list(
      location,
      publisher,
      offer,
      sku,
      { top: 1 }
    );
  };
  // fonction to get ip adress of the new virtual machine
  const getIpAdress = async () => {
    try {
      const vmInfo = await compute.virtualMachines.get(resourceGroupId, vmId);

      const networkInterfaceId = vmInfo.networkProfile.networkInterfaces[0].id;

      const networkInterface = await network.networkInterfaces.get(
        resourceGroupId,
        networkInterfaceId.split("/")[8]
      );

      const publicIPAddressId =
        networkInterface.ipConfigurations[0].publicIPAddress.id;
      const publicIPAddress = await network.publicIPAddresses.get(
        resourceGroupId,
        publicIPAddressId.split("/")[8]
      );

      const ipAddress = publicIPAddress.ipAddress;

      return ipAddress;
    } catch (error) {
      console.error(
        "Une erreur s'est produite lors de la récupération de l'adresse IP publique : ",
        error
      );
      throw error;
    }
  };

  return new Promise(async (resolve) => {
    createVirtualMachine()
      .then(async (res) => {
        // start the vm
        await compute.virtualMachines.beginStart(resourceGroupId, vmId);
        // get and show ip
        const ip = await getIpAdress();
        // delete vm after deleting time
        const deletTime = DateTime.now().plus({ minute: 2 }).toISO();

        setTimeout(async () => {
          await compute.virtualMachines.beginStart(resourceGroupId, vmId);
          await resource.resourceGroups.beginDeleteAndWait(resourceGroupId);
        }, Number(process.env.DELETE_TIME));

        resolve({
          ip: ip,
          user: AdminVmUser,
          password: AdminVmPassword,
          os: res.storageProfile.osDisk.osType,
          deletingAt: deletTime,
        });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  });
};

const generateId = (prefix) => {
  const randomIdLength = 15 - prefix.length;
  const randomId = uuidv4().replace(/-/g, "").substring(0, randomIdLength);
  return `${prefix}${randomId}`;
};
