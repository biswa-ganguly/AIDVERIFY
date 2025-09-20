// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract CampaignManager {
    struct Campaign {
        bytes32 Campaign_id;
        string title;
        string description;
        string location;
        string ngo;            // NGO email
        uint256 targetAmount;
        uint256 totalReceived;
        bool isActive;
    }

    // --- Storage ---
    bytes32[] public allCampaignIds;
    mapping(bytes32 => Campaign) internal Campaigns;

    // Mapping from NGO email → their campaigns
    mapping(string => bytes32[]) internal campaignsByNgo;

    // --- Events ---
    event CampaignCreated(bytes32 indexed campaignId, string title, string indexed ngoEmail, uint256 targetAmount);
    event CampaignClosed(bytes32 indexed campaignId, string indexed ngoEmail);
    event DonationReceived(bytes32 indexed campaignId, string indexed donorEmail, uint256 amount);

    // --- Internal unique ID generator ---
    function uniqueIdGenerator() private view returns (bytes32) {
        return keccak256(
            abi.encodePacked(msg.sender, block.timestamp, block.prevrandao, blockhash(block.number - 1))
        );
    }

    // --- Create a new campaign ---
    function createCampaign(
        string memory camp_name,
        string memory camp_desc,
        string memory camp_location,
        string memory ngoEmail,
        uint256 camp_targetAmount
    ) public {
        require(camp_targetAmount > 0, "Target amount must be greater than 0");
        require(bytes(ngoEmail).length > 0, "NGO email required");

        bytes32 campaignId = uniqueIdGenerator();

        Campaigns[campaignId] = Campaign({
            Campaign_id: campaignId,
            title: camp_name,
            description: camp_desc,
            location: camp_location,
            ngo: ngoEmail,
            targetAmount: camp_targetAmount,
            totalReceived: 0,
            isActive: true
        });

        allCampaignIds.push(campaignId);
        campaignsByNgo[ngoEmail].push(campaignId);

        emit CampaignCreated(campaignId, camp_name, ngoEmail, camp_targetAmount);
    }

    // --- Get campaign details ---
    function getCampaign(bytes32 id) public view returns(
        string memory, string memory, string memory, uint256, uint256, bool, string memory
    ) {
        require(bytes(Campaigns[id].ngo).length > 0, "Campaign does not exist");

        Campaign memory camp = Campaigns[id];
        return (
            camp.title,
            camp.description,
            camp.location,
            camp.targetAmount,
            camp.totalReceived,
            camp.isActive,
            camp.ngo
        );
    }

    // --- Close a campaign ---
    function closeCampaign(bytes32 id, string memory ngoEmail) public {
        require(bytes(Campaigns[id].ngo).length > 0, "Campaign does not exist");
        require(keccak256(bytes(ngoEmail)) == keccak256(bytes(Campaigns[id].ngo)), "Only the NGO can close this campaign");
        require(Campaigns[id].isActive, "Campaign is already closed");

        Campaigns[id].isActive = false;

        emit CampaignClosed(id, ngoEmail);
    }

    // --- Get all campaign IDs ---
    function getAllCampaignID() public view returns (bytes32[] memory) {
        return allCampaignIds;
    }

    // --- Get campaigns for a specific NGO email ---
    function getCampaignsByNgo(string memory ngoEmail) public view returns (bytes32[] memory) {
        return campaignsByNgo[ngoEmail];
    }
}
