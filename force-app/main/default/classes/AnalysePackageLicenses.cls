// start here
// return [SELECT NamespacePrefix,AllowedLicenses,UsedLicenses,Status,IsProvisioned, CreatedDate,ExpirationDate,LastModifiedDate,Id FROM PackageLicense];        

public with sharing class AnalysePackageLicenses {

    @AuraEnabled(cacheable=true)
    public static List<PackageLicense> getPackageLicense() {
        return [SELECT Id, NamespacePrefix, AllowedLicenses, UsedLicenses, Status, IsProvisioned, CreatedDate, ExpirationDate, LastModifiedDate 
        FROM PackageLicense ORDER BY AllowedLicenses DESC];
    }

    @AuraEnabled(cacheable=true)
    public static List<PackageLicense> findPackages(String searchKey) {
        String key = '%' + searchKey + '%';   
        if (String.isBlank(searchKey)) {
            return [SELECT Id, NamespacePrefix, AllowedLicenses, UsedLicenses, Status, IsProvisioned, CreatedDate, ExpirationDate, LastModifiedDate 
            FROM PackageLicense ORDER BY AllowedLicenses DESC];
        } else {
            return [SELECT Id, NamespacePrefix, AllowedLicenses, UsedLicenses, Status, IsProvisioned, CreatedDate, ExpirationDate, LastModifiedDate 
            FROM PackageLicense WHERE NamespacePrefix LIKE :key ORDER BY AllowedLicenses DESC]; 
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<PackageLicense> getFirstPackageNamespacePrefix() {
        return [SELECT NamespacePrefix FROM PackageLicense ORDER BY AllowedLicenses DESC LIMIT 1];
    }

    @AuraEnabled(cacheable=true)
    public static List<PackageLicense> getSpecificPackageLicense(String packageKey, String ifPackageKeyNull) {
        String key = packageKey;
        if (String.isBlank(packageKey)) {
            return [SELECT NamespacePrefix, AllowedLicenses, UsedLicenses FROM PackageLicense 
            WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)];
        } else {
            return [SELECT NamespacePrefix, AllowedLicenses, UsedLicenses FROM PackageLicense 
            WHERE (PackageLicense.NamespacePrefix LIKE :key)];
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<User> getUserList(String packageKey, String ifPackageKeyNull) {
        String key = packageKey;
        if (String.isBlank(packageKey)) {
            return [SELECT Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name 
            FROM User 
            WHERE Id in (SELECT UserId FROM UserPackageLicense WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) ORDER BY Name];
        }
        else {
            return [SELECT Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name 
            FROM User 
            WHERE Id in (SELECT UserId FROM UserPackageLicense WHERE (PackageLicense.NamespacePrefix LIKE :key)) ORDER BY Name];
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<User> findUsers(String searchKey, String ifPackageKeyNull) {
        String key = '%' + searchKey + '%';  
        if (String.isBlank(searchKey)) {
            return [SELECT Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name 
            FROM User 
            WHERE Id in (SELECT UserId FROM UserPackageLicense WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) ORDER BY Name
            ];
        } else {
            return [SELECT Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name 
            FROM User 
            WHERE Name LIKE :key AND Id in (SELECT UserId FROM UserPackageLicense WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) ORDER BY Name
            ];
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<User> getUsersListWithNoOEM() {
        return [SELECT Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name 
        FROM User 
        WHERE Id NOT IN ( SELECT UserId FROM UserPackageLicense ) ORDER BY Name
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<User> findUsersListWithNoOEM(String searchKey) {
        String key = '%' + searchKey + '%'; 
        if (String.isBlank(searchKey)) {
            return [SELECT Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name 
            FROM User 
            WHERE Id NOT IN ( SELECT UserId FROM UserPackageLicense ) ORDER BY Name
            ];    
        } else {
            return [SELECT Id, Name, IsActive, Alias, Username, ProfileId, UserRoleId, Profile.Name, UserRole.Name, Profile.UserLicense.Name 
            FROM User 
            WHERE Name LIKE :key AND Id NOT IN ( SELECT UserId FROM UserPackageLicense ) ORDER BY Name
            ];
        }
    }

    // //SELECT SomePicklist__c value, COUNT(Id) recordCount FROM SomeObject__c GROUP BY SomePicklist__c
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getUsersCountByLicenseStatus(String ifPackageKeyNull) {
        // ifPackageKeyNull = 'BMCServiceDesk';
        // return [SELECT Profile.UserLicense.Name License, IsActive, Count(Id) Quantity FROM User 
        // WHERE Id IN (SELECT UserId FROM UserPackageLicense) 
        // Group By Profile.UserLicense.Name, IsActive ORDER BY Profile.UserLicense.Name, IsActive];

        return [SELECT Profile.UserLicense.Name License, IsActive, Count(Id) Quantity FROM User 
        WHERE Id IN (SELECT UserId FROM UserPackageLicense 
        WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) 
        Group By Profile.UserLicense.Name, IsActive ORDER BY Profile.UserLicense.Name, IsActive];

    }
    
    
    // //SELECT SomePicklist__c value, COUNT(Id) recordCount FROM SomeObject__c GROUP BY SomePicklist__c
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getUsersByProfiles(String ifPackageKeyNull) {
        // ifPackageKeyNull = 'BMCServiceDesk';
        return [SELECT Profile.Name, Count(Id) Quantity FROM User WHERE Id IN (SELECT UserId FROM UserPackageLicense 
        WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) Group By Profile.Name ORDER BY Profile.Name];
    }

    // //SELECT SomePicklist__c value, COUNT(Id) recordCount FROM SomeObject__c GROUP BY SomePicklist__c
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getUsersByStatus(String ifPackageKeyNull) {
        // ifPackageKeyNull = 'BMCServiceDesk';
        return [SELECT IsActive, Count(Id) Quantity FROM User WHERE Id IN (SELECT UserId FROM UserPackageLicense 
        WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) Group By IsActive ORDER BY IsActive];
    }

    // //SELECT SomePicklist__c value, COUNT(Id) recordCount FROM SomeObject__c GROUP BY SomePicklist__c
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getUsersByLicense(String ifPackageKeyNull) {
        // ifPackageKeyNull = 'BMCServiceDesk';
        return [SELECT Profile.UserLicense.Name License, Count(Id) Quantity FROM User WHERE Id IN (SELECT UserId FROM UserPackageLicense 
        WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) Group By Profile.UserLicense.Name ORDER BY Profile.UserLicense.Name];
    }
// number of users per package OEM
// IsActive, Licenses, Count 
    // //SELECT SomePicklist__c value, COUNT(Id) recordCount FROM SomeObject__c GROUP BY SomePicklist__c
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getUsersByRole(String ifPackageKeyNull) {
        // ifPackageKeyNull = 'BMCServiceDesk';
        return [SELECT UserRole.Name Role, Count(Id) Quantity FROM User WHERE Id IN (SELECT UserId FROM UserPackageLicense 
        WHERE (PackageLicense.NamespacePrefix LIKE :ifPackageKeyNull)) Group By UserRole.Name ORDER BY UserRole.Name];
    }

    // 
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> allLicenseSummarywithOEM() {
        // working query
        return [SELECT Profile.UserLicense.Name License, IsActive, Count(Id) Quantity FROM User 
        WHERE Id IN (SELECT UserId FROM UserPackageLicense) 
        Group By Profile.UserLicense.Name, IsActive ORDER BY Profile.UserLicense.Name, IsActive];
        
        // // testing get PackageLicense.NamespacePrefix
        // return [SELECT Profile.UserLicense.Name License, IsActive,
        // (SELECT PackageLicense__r.NamespacePrefix, Count(UserId) Quantity FROM UserPackageLicense__r
        // Group By PackageLicense.NamespacePrefix) 
        // FROM User 
        // Group By Profile.UserLicense.Name, IsActive ORDER BY Profile.UserLicense.Name, IsActive];

    }

    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> allLicenseSummarywithoutOEM() {
        // ifPackageKeyNull = 'BMCServiceDesk';
        // List<AggregateResult> list1 = [SELECT Profile.UserLicense.Name License, IsActive, Count(Id) Quantity FROM User 
        // WHERE Id IN (SELECT UserId FROM UserPackageLicense) 
        // Group By Profile.UserLicense.Name, IsActive ORDER BY Profile.UserLicense.Name, IsActive];
        
        // List<AggregateResult> list2 = [SELECT Profile.UserLicense.Name License, IsActive, Count(Id) Quantity FROM User 
        // WHERE Id NOT IN (SELECT UserId FROM UserPackageLicense) 
        // Group By Profile.UserLicense.Name, IsActive ORDER BY Profile.UserLicense.Name, IsActive];
        
        // List<AggregateResult> finalList;
        // finalList.addAll(list1);
        // finalList.addAll(list2);

        // return finalList;

        return [SELECT Profile.UserLicense.Name License, IsActive, Count(Id) Quantity FROM User 
        WHERE Id NOT IN (SELECT UserId FROM UserPackageLicense) 
        Group By Profile.UserLicense.Name, IsActive ORDER BY Profile.UserLicense.Name, IsActive];
    }

// 7467 - SF platform 
// 1467 - active remedyforce users
// 6000 - non remedyforce users

// 4000 - bought SF platform licenses


}

