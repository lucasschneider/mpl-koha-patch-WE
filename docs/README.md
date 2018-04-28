# MPL Koha Patch

| Current Version | Supported Browsers                          | Author          |
| :-------------: | :-----------------------------------------: | :-------------: |
|                 | (Click the appropriate browser to install.) |                 |
| 21.4.2          | [Firefox][1]<br>[Google Chrome](https://chrome.google.com/webstore/detail/mpl-koha-patch/ojghlgghnljabcikeiipjadgblclkgpi) | Lucas Schneider<br>Library Page II<br>MPL–Central |

The MPL Koha Patch is a WebExtension built for Firefox and Google Chrome which augments the display of LibLime Koha to make various tasks more convenient for library staff. While it is developed for use by member libraries of Wisconsin's South Central Library System, it is not supported by SCLS, but is an independent project by a Library Page at Madison Central Library.

This extension is ___not___ intended for use with the open source [Koha ILS](https://koha-community.org),  originally created by New Zealand librarians.

## Table of Contents
* [Inherent features of the extension](#inherent-features-of-the-extension)
	* [Sorting lists of libraries in Koha](#sorting-lists-of-libraries-in-koha)
	* [Generating dorm expiration dates](#generating-dorm-expiration-dates)
	* [Standardize patron entry formatting](#standardize-patron-entry-formatting)
	* [Bring 'Session Checkouts' list to top of screen](#bring-session-checkouts-list-to-top-of-screen)
	* [Limit patron edit input fields](#limit-patron-edit-input-fields)
	* [Item checkout history sort options](#item-checkout-history-sort-options)
	* [Print patron's barcode number](#print-patrons-barcode-number)
	* [Separate CDs in Holds Shelf Action List](#separate-cds-in-holds-shelf-action-list)
	* [Text notification checkbox (by request only)](#text-notification-checkbox-by-request-only)
* [Optional Features](#optional-features)
	* [Select a display](#select-a-display)
	* [Additional patron messages](#additional-patron-messages)
	* [Validate Madison addresses](#validate-madison-addresses)
	* [Autofill OPAC login number](#autofill-opac-login-number)
	* [Lookup "sort 1" (PSTAT)](#lookup-sort-1-pstat)
	* [Autoselect "Digests Only"](#autoselect-digests-only)
	* [Due date/advanced notice toggle](#due-dateadvanced-notice-toggle)
	* [Generate middle initials](#generate-middle-initials)
	* [Update account type](#update-account-type)
	* [Receipt font](#receipt-font)
	* [Disable dropbox mode](#disable-dropbox-mode)
* [Keyboard Shortcuts](#keyboard-shortcuts)
* [Bug reporting and developer contact](#bug-reporting-and-developer-contact)
* [Disclaimer](#disclaimer)


# Inherent features of the extension
This extension comes with several features that cannot be disabled. This is because they are either known to be completely bug-free or because they standardize the formatting of data entry
## Extension Dropdown Menu
After installing the MPL Koha Patch you will notice an icon at the top right of the screen. By deault it will show the Madison Public Library logo, but this can be changed on the extension preferences page. There are a number of tools and links to frequently used websites (currenly they are MPL-centric, but there are plans to make them customizable in the future) that can be accessed from this dropdown panel.

<dl>
  <dt>Generate Problem Item Form:</dt>
  <dd>Clicking this link will open a fillable SCLS Problem Item Form in a new tab. Both the patron and item data can be automatically retrieved from the barcode by clicking the button that appears after each respective field. IT is important to note the item's "Use" value is determined by the number of times the item barcode appears in the record's Checkout History Table. This value may be smaller than the actual item use which can only be determined if you're logged into Koha as the item's owning library. While the collected value can give you a general idea as to the item's use, it should not be used for determining things like whether a damaged item should be withdrawn.<br><br>When completed, the form may be sent to your receipt printer. Further instructions will appear after printing based on the type of problem (e.g. Damaged Item found in Book Drop, Parts Missing item that arrived via Transit Hold, etc.).<br><br>From any other page in Koha, there are two additional ways you can initiate the Problem Item Form. Any hyperlinked barcode number and any highlighted barcode number (i.e. selected text as when copy/pasting) may be right clicked and from the context menu you may select "Use Barcode in Problem Item Form." Not only will this open the problem form in a new tab, but it will also automatically start gathering either patron or item data based on the barcode that was selected.</dd>
  <dt>Add Payment Plan Note:</dt>
  <dd>This link will automatically generate the note for setting up an Madison Public Libary payment plan if you are currently editing a patron's record. A popup note will ask you to enter the initial balance on the patron's account, and the extension will fill in the rest.</dd>
  <dt>Add lost library card note</dt>
  <dd>This link will automatically generate both the circulation and OPAC notes to notify a patron that their library card was found. Just enter the name of your library location in the subsequent popup note, and the extension will fill in the rest. You must be currently editing a patron's record to use this tool.</dd>
  <dt>Generate PSTAT from Secondary Address</dt>
  <dd>When patron's have separate residential and mailing addresses, it is customary to enter the mailing address in the primary address fields, and their residential address in the alternate address fields. For statistical purposes, the "sort 1" (PSTAT) value should be based on the residential address and <b><i>not</i></b> the  mailing address. Since the PSTAT is normally automatically found using the primary address (assuming you have enabled this feature) this link is necessary to find the PSTAT when the mailing address and residential address are different. You must be currently editing a patron's record to use this tool.</dd>
  <dt>Generate Calendar Announcements</dt>
  <dd>This link is used to automatically select all of the necessary options when downloading upcoming event data for Madison Public Libraries. This link is only relevant to the Print-copy/Web Services Page who works at MPL-Central.</dd>
</dl>

Currently, the bookmark links available are as follows:

1. Koha--Checkin
2. Koha--Checkout
3. American Fact Finder (for PSTAT lookup)
4. Madison Public Library's Homepage
5. MPL staff website
6. MPL reference tools page

In the next extension update, links 4-6 will be able to be custom set in the extension preferences.

## Sorting lists of libraries in Koha
All lists of libraries in LibLime Koha are sorted alphabetically. This includes, but is not limited to, the "Library" list on the login screen, the list to select hold pickup locations, and the list to select a patron's home library.
## Generating dorm expiration dates
This feature automatically sets any new patron’s library card expiration date to the end of the current academic school year (5/15) if they are living at a UW--Madison university dorm.
## Standardize patron entry formatting
All text fields of a patrons record are forced to be uppercase except for the email address fields which are forced to be lowercase. The city and state format for the City of Madison is forcibly "MADISON WI" and library staff may enter "mad" as a shortcut for and "MADISON WI" address.
## Bring 'Session Checkouts' list to top of screen
This feature ensures that a patron's 'session checkouts' appears at the top of the screen regardless of how many waiting holds or special notes appear on the checkout screen.
## Limit patron edit input fields
This feature disables many of the rarely used input fields which appear while editing a patron’s record. This encourages library staff to maintain a consistent system of data entry across patron accounts. This may be overridden to enable all input fields by checking the checkbox at the top of the patron edit page.

If you are logged into Koha as one of the MPL libraries, this will even more greatly reduce the available input fields when creating a new web-use only account. Additionally, the address, PSTAT, and circulation note fields will be automatically filled in by MPL standards.
## Item checkout history sort options
This feature ensures that an item’s checkout history is sorted completely chronologically. By default, the table will be sorted by checkout date in descending order (i.e. most recent checkouts will appear at the top). You may choose to sort the items by checkout date, due date, or return date in either ascending or descending order. There is also a box to check if you wish to group the items by barcode number.
## Print patron's barcode number
From a patron's checkout or details screen you may click a button to print their barcode number using the receipt printer. Go to the extension's preferences page to select one of two font sizes
## Separate CDs in Holds Shelf Action List
A checkbox has been added to the Holds Shelf Action page that enables staff to separate CD holds from all other holds at the bottom of the table, sorted alphabetically by the patron's last name.
## Text notification checkbox (by request only)
This feature adds a checkbox to the patron edit page in Koha to more easily toggle SMS notifications on or off. The checkbox moves a patron's email address (if there is one) to the alternate contact section and prepends "T1-" to the primary phone number (which is assumed to be a cell phone number). Unchecking the box will reverse these changes.

Because this checkbox only moves data around on the patron edit form. A phone number (and, optionally, an email address) _must_ be entered before using the checkbox. Similarly, checking the box cannot 100% guarantee that the patron's data

__Libraries currently using this feature:__<br>
* ALM
* PLO
* ROS
* STP

[Contact Lucas](mailto:lschneider@madisonpubliclibrary.org) if your library would like access to this feature.

# Optional features
The following features may be turned on or off from the extension's preferences page. By default, they are all enabled ___except___ "Disable dropbox mode" which is disabled by default and is discouraged form use by MPL.
## Select a display
"Select a display" determines which logo is used for the extension's toolbar icon. [Contact Lucas][3] if your library would like its logo as an option.

| MPL | MID | SCLS | SUN |
| --- | --- | ---- | --- |
| <img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/mpl-logo.png" width="64px" > | <img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/mid-logo.png" width="64px" > |<img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/scls-logo.png" width="64px" > |<img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/content/img/sun-icon2-64.png" width="64px" > |

<img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/scnShot-highlighted-logo.png" >

## Additional patron messages
This option removes the predefined patron message "Special Note" provided by LibLime Koha, which  is rarely or never used by MPL staff.

Additionally, this option adds predefined messages to the selection list which are frequently used, but not provided by LibLime Koha:

* "Patron must have library card at next checkout."
* "Patron has signed Laptop/iPad Loan Agreement form. Form on file."

Additionally, selecting the checkbox for "Include notes for returned mail and bad emails" will include messages for mail or library cards returned by the post office, email addresses not being recognized, and email boxes being full.
## Validate Madison addresses
This option alerts staff with a dialog box whenever an unacceptable or restricted address has been entered in a patron record. This minimizes the number of limited use or unacceptable accounts being set up with full-access library cards. See examples below. A note on the patron’s account will be automatically generated.

<img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/scnShot-unacceptable-address.png" >

<img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/scnShot-restricted-address.png" >

## Autofill OPAC login number
Because a patron's library card number is used for their OPAC username, this feature automatically enters
the OPAC login when a barcode is scanned into the barcode field.
## Lookup "sort 1" (PSTAT)
<img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/scnShot-pstat-lookup.png" >

This feature will attempt to automatically enter the zipcode and PSTAT for any address. It is important to ensure that the street address, city, and state abbreviation are entered and correctly spelled. It starts with the most recent census data, and falls back on the 2010 census data. This will look up the census tract number for Madison address, and the county subdivision for addresses both within and outside SCLS. The cities of Middleton, Monona, and Sun Prairie and and parts of Verona select the PSTAT based on the patron’s aldermanic district. With future updates, the city of Verona  will be fully supported.

<img src="https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/docs/markdown-img/scnShot-geo-home-library.png" >

You also have the option to find the SCLS location that is geographically closest to the patron’s address. You may search among the MPL locations, within one of the seven counties, or within SCLS as a whole. This is particularly useful for reciprocal library patrons or those who have recently moved.

## Autoselect "Digests Only"
This feature automatically selects the "Digests Only" checkbox (when applicable) and sets the advance notice options to "2" (days) when checking the email column of the patron notification option list.
## Due date/advanced notice toggle
This feature forces staff to select either the "Due Date" or "Advance Notice" notification options, but not both, in order to avoid messaging conflicts resulting in the failure to send any notification.
## Generate middle initials
This feature generates the middle initial field based on the value entered for a patron's first name.
## Update account type
This feature will allow you to update a patron's account type from juvenile to adult or limited use juvenile to limited use upon saving their record if the patron is at least 16 years old on the day you are editing their record.
## Receipt Font
You may choose to have a patron's barcode print in size 36px font (used by MPL) or size 28 font (requested by Monona library). If your library would needs the font size to appear larger or smaller than the two available options, please [contact Lucas](mailto:lschneider@madisonpubliclibrary.org).
## Disable dropbox mode
This feature was requested by Monona library, which does not use dropbox mode. In most cases this feature should remain disabled. It should ___not___ be used by staff of a Madison Public Library location.
# Keyboard shortcuts

| Key Command      | Function |
| ---------------- | -------- |
| [CTRL] + [SPACE] | Prompts the user to save a patron's record |
| [ESC]            | Cancels editing a patron's record and returns to their overview page |

# Bug reporting and developer contact
This Firefox extension is developed by Lucas Schneider, a Page II at Madison Public Library, Central. If you run into any bugs, enter “about:addons” in the Firefox web address bar (without quotes) or "chrome://extensions" in Google Chrome, go to the options page for “MPL Koha Patch,” and disable the feature causing problems. If the problem does not persist after disabling the feature, send Lucas an email with a description of the bug.

You can email Lucas comments, questions, or feature requests at [lschneider@madisonpubliclibrary.org](mailto:lschneider@madisonpubliclibrary.org)

# Disclaimer
This extension is neither supported nor endorsed by LibLime or SCLS. It is independently developed by Lucas Schneider, a Library Page at MPL-Central. Please use the extension only at the discretion of your circulation or departmental supervisor.

  [1]: javascript:void(InstallTrigger.install({'MPL Koha Patch':'https://raw.githubusercontent.com/lucasschneider/mpl-koha-patch-WE/master/releases/currXPI/mpl-koha-patch.xpi'}));
