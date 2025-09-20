// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract NgoManager {
    struct NGO {
        bytes32 Ngo_id;
        string NgoName;
        uint256 regNo;
        string website;
        string contactPerson;
        string contactEmail;
    }

    // Mappings for storage
    mapping(bytes32 => NGO) private ngosById;      // ngoId → NGO
    mapping(string => bytes32) private ngoIdByEmail; // email → ngoId

    // Event for registration
    event NgoRegistered(
        bytes32 indexed ngoId,
        string NgoName,
        uint256 regNo,
        string website,
        string contactPerson,
        string contactEmail
    );

    /// @notice Register a new NGO
    function registerNgo(
        string memory _ngoName,
        uint256 _regNo,
        string memory _website,
        string memory _contactPerson,
        string memory _contactEmail
    ) public {
        // create a unique id (based on email + block timestamp for uniqueness)
        bytes32 ngoId = keccak256(abi.encodePacked(_contactEmail, block.timestamp));

        require(ngoIdByEmail[_contactEmail] == 0x0, "NGO already registered with this email");

        NGO memory newNgo = NGO({
            Ngo_id: ngoId,
            NgoName: _ngoName,
            regNo: _regNo,
            website: _website,
            contactPerson: _contactPerson,
            contactEmail: _contactEmail
        });

        ngosById[ngoId] = newNgo;
        ngoIdByEmail[_contactEmail] = ngoId;

        emit NgoRegistered(
            ngoId,
            _ngoName,
            _regNo,
            _website,
            _contactPerson,
            _contactEmail
        );
    }

    /// @notice Get NGO details by ngoId
    function getNgoById(bytes32 _ngoId) public view returns (NGO memory) {
        require(ngosById[_ngoId].Ngo_id != 0x0, "NGO not found");
        return ngosById[_ngoId];
    }

    /// @notice Get NGO details by email
    function getNgoByEmail(string memory _email) public view returns (NGO memory) {
        bytes32 ngoId = ngoIdByEmail[_email];
        require(ngoId != 0x0, "NGO not found with this email");
        return ngosById[ngoId];
    }
}
