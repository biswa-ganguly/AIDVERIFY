// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract CampaignManager {
    struct Campaign {
        bytes32 Campaign_id;
        string title;
        string description;
        string location;
        address ngo;            // NGO/admin wallet
        uint256 targetAmount;
        uint256 totalReceived;
        bool isActive;
    }

    // This array will store all campaign IDs
    bytes32[] public allCampaignIds;

    mapping (bytes32 => Campaign) internal Campaigns;

    // --- Events ---
    event CampaignCreated(bytes32 indexed campaignId, string title, address indexed ngo, uint256 targetAmount);
    event CampaignClosed(bytes32 indexed campaignId, address indexed ngo);
    event DonationReceived(bytes32 indexed campaignId, address indexed donor, uint256 amount);

    // --- Internal unique ID generator ---
    function uniqueIdGenerator() private view returns(bytes32) {
        return keccak256(
            abi.encodePacked(msg.sender, block.timestamp, block.prevrandao, blockhash(block.number-1))
        );
    }

    // --- Create a new campaign ---
    function createCampaign(
        string memory camp_name,
        string memory camp_desc,
        string memory camp_location,
        uint256 camp_targetAmount
    ) public {
        require(camp_targetAmount > 0, "Target amount must be greater than 0");

        bytes32 campaignId = uniqueIdGenerator();

        Campaigns[campaignId] = Campaign({
            Campaign_id: campaignId,
            title: camp_name,
            description: camp_desc,
            location: camp_location,
            ngo: msg.sender,
            targetAmount: camp_targetAmount,
            totalReceived: 0,
            isActive: true
        });

        allCampaignIds.push(campaignId);

        emit CampaignCreated(campaignId, camp_name, msg.sender, camp_targetAmount);
    }

    // --- Get campaign details ---
    function getCampaign(bytes32 id) public view returns(
        string memory, string memory, string memory, uint256, uint256, bool
    ) {
        require(Campaigns[id].ngo != address(0), "Campaign does not exist");

        Campaign memory camp = Campaigns[id];
        return (
            camp.title,
            camp.description,
            camp.location,
            camp.targetAmount,
            camp.totalReceived,
            camp.isActive
        );
    }

    // --- Close a campaign ---
    function closeCampaign(bytes32 id) public {
        require(Campaigns[id].ngo != address(0), "Campaign does not exist");
        require(
            msg.sender == Campaigns[id].ngo,
            "Only Admin/NGO can close the campaign"
        );
        require(Campaigns[id].isActive, "Campaign is already closed");

        Campaigns[id].isActive = false;

        emit CampaignClosed(id, msg.sender);
    }

    // --- Get all campaign IDs ---
    function getAllCampaignID() public view returns(bytes32[] memory) {
        return allCampaignIds;
    }
}
