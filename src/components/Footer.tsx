import Link from 'next/link';

const mailchimpEmbed = `<div id="mc_embed_shell">
      <link href="//cdn-images.mailchimp.com/embedcode/classic-061523.css"
rel="stylesheet" type="text/css">
  <style type="text/css">
        #mc_embed_signup{background:#fff; false;clear:left; font:14px
Helvetica,Arial,sans-serif; width: 600px;}
        /* Add your own Mailchimp form style overrides in your site
stylesheet or in this style block.
           We recommend moving this block and the preceding CSS link to the
HEAD of your HTML file. */
</style>
<div id="mc_embed_signup">
    <form action="
https://classicalrevolution.us7.list-manage.com/subscribe/post?u=a3476f0ba3a89ad4a4df5c773&amp;id=3498d7ab59&amp;f_id=0014d2e4f0"
method="post" id="mc-embedded-subscribe-form"
name="mc-embedded-subscribe-form" class="validate" target="_blank">
        <div id="mc_embed_signup_scroll"><h2>Subscribe</h2>
            <div class="indicates-required"><span class="asterisk">*</span>
indicates required</div>
            <div class="mc-field-group"><label for="mce-EMAIL">Email
Address <span class="asterisk">*</span></label><input type="email"
name="EMAIL" class="required email" id="mce-EMAIL" required=""
value=""></div><div class="mc-field-group"><label for="mce-FNAME">First
Name <span class="asterisk">*</span></label><input type="text" name="FNAME"
class="required text" id="mce-FNAME" required="" value=""></div><div
class="mc-field-group"><label for="mce-LNAME">Last Name </label><input
type="text" name="LNAME" class=" text" id="mce-LNAME" value=""></div><div
class="mc-field-group"><label for="mce-CITY">City </label><input
type="text" name="CITY" class=" text" id="mce-CITY" value=""></div><div
class="mc-field-group"><label for="mce-STATE">State </label><input
type="text" name="STATE" class=" text" id="mce-STATE" value=""></div><div
class="mc-field-group"><label for="mce-COUNTRY">Country </label><input
type="text" name="COUNTRY" class=" text" id="mce-COUNTRY"
value=""></div><div class="mc-field-group"><label
for="mce-INSTRUMENT">Instrument(s) </label><input type="text"
name="INSTRUMENT" class=" text" id="mce-INSTRUMENT" value=""></div><div
class="mc-field-group"><label for="mce-MMERGE24">How did you hear about us?
</label><input type="text" name="MMERGE24" class=" text" id="mce-MMERGE24"
value=""></div><div class="mc-field-group"><label
for="mce-MMERGE27">Questions, comments, suggestions? </label><input
type="text" name="MMERGE27" class=" text" id="mce-MMERGE27"
value=""></div><div class="mc-field-group"><label for="mce-MMERGE5">Company
</label><input type="text" name="MMERGE5" class=" text" id="mce-MMERGE5"
value=""></div>
        <div id="mce-responses" class="clear foot">
            <div class="response" id="mce-error-response" style="display:
none;"></div>
            <div class="response" id="mce-success-response" style="display:
none;"></div>
        </div>
    <div aria-hidden="true" style="position: absolute; left: -5000px;">
        /* real people should not fill this in and expect good things - do
not remove this or risk form bot signups */
        <input type="text" name="b_a3476f0ba3a89ad4a4df5c773_3498d7ab59"
tabindex="-1" value="">
    </div>
        <div class="optionalParent">
            <div class="clear foot">
                <input type="submit" name="subscribe"
id="mc-embedded-subscribe" class="button" value="Subscribe">
                <p style="margin: 0px auto;"><a href="
http://eepurl.com/jxpdNQ" title="Mailchimp - email marketing made easy and
fun"><span style="display: inline-block; background-color: transparent;
border-radius: 4px;"><img class="refferal_badge" src="
https://digitalasset.intuit.com/render/content/dam/intuit/mc-fe/en_us/images/intuit-mc-rewards-text-dark.svg"
alt="Intuit Mailchimp" style="width: 220px; height: 40px; display: flex;
padding: 2px 0px; justify-content: center; align-items:
center;"></span></a></p>
            </div>
        </div>
    </div>
</form>
</div>
<script type="text/javascript" src="//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"></script><script
type="text/javascript">(function($) {window.fnames = new Array();
window.ftypes = new
Array();fnames[0]='EMAIL';ftypes[0]='email';fnames[1]='FNAME';ftypes[1]='text';fnames[2]='LNAME';ftypes[2]='text';fnames[9]='CITY';ftypes[9]='text';fnames[10]='STATE';ftypes[10]='text';fnames[24]='COUNTRY';ftypes[24]='text';fnames[11]='INSTRUMENT';ftypes[11]='text';fnames[12]='MMERGE24';ftypes[12]='text';fnames[13]='MMERGE27';ftypes[13]='text';fnames[5]='MMERGE5';ftypes[5]='text';fnames[4]='MMERGE4';ftypes[4]='phone';fnames[6]='MMERGE6';ftypes[6]='text';fnames[7]='MMERGE7';ftypes[7]='zip';fnames[3]='MMERGE3';ftypes[3]='text';}(jQuery));var
$mcj = jQuery.noConflict(true);
    // SMS Phone Multi-Country Functionality
    if(!window.MC) {
      window.MC = {};
    }
    window.MC.smsPhoneData = {
      defaultCountryCode: 'US',
      programs: [],
      smsProgramDataCountryNames: []
    };

    function getCountryUnicodeFlag(countryCode) {
       return countryCode.toUpperCase().replace(/./g, (char) =>
String.fromCodePoint(char.charCodeAt(0) + 127397))
    };

    // HTML sanitization function to prevent XSS
    function sanitizeHtml(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // URL sanitization function to prevent javascript: and data: URLs
    function sanitizeUrl(url) {
      if (typeof url !== 'string') return '';
      const trimmedUrl = url.trim().toLowerCase();
      if (trimmedUrl.startsWith('javascript:') ||
trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('vbscript:')) {
        return '#';
      }
      return url;
    }

    const getBrowserLanguage = () => {
      if (!window?.navigator?.language?.split('-')[1]) {
        return window?.navigator?.language?.toUpperCase();
      }
      return window?.navigator?.language?.split('-')[1];
    };


    function getDefaultCountryProgram(defaultCountryCode, smsProgramData) {
      if (!smsProgramData || smsProgramData.length === 0) {
        return null;
      }

      const browserLanguage = getBrowserLanguage();

      if (browserLanguage) {
        const foundProgram = smsProgramData.find(
          (program) => program?.countryCode === browserLanguage,
        );
        if (foundProgram) {
          return foundProgram;
        }
      }

      if (defaultCountryCode) {
        const foundProgram = smsProgramData.find(
          (program) => program?.countryCode === defaultCountryCode,
        );
        if (foundProgram) {
          return foundProgram;
        }
      }

      return smsProgramData[0];
    }

    function updateSmsLegalText(countryCode, fieldName) {
      if (!countryCode || !fieldName) {
        return;
      }

      const programs = window?.MC?.smsPhoneData?.programs;
      if (!programs || !Array.isArray(programs)) {
        return;
      }

      const program = programs.find(program => program?.countryCode ===
countryCode);
      if (!program || !program.requiredTemplate) {
        return;
      }


      var smsConsentHtmlRenderingFixEnabled = true;

      const legalTextElement = document.querySelector('#legal-text-' +
fieldName);
      if (!legalTextElement) {
        return;
      }

      const divRegex = new RegExp('</?[div][^>]*>', 'gi');
      const blockWrapperRegex = new RegExp('</?(?:div|p)[^>]*>', 'gi');
      const fullAnchorRegex = new RegExp('<a.*?</a>', 'g');
      const anchorRegex = new RegExp('<a href="(.*?)"
target="(.*?)">(.*?)</a>');

      const template = smsConsentHtmlRenderingFixEnabled
        ? program.requiredTemplate
            .replace(/<\/p>\s*<p[^>]*>/gi, ' ')
            .replace(blockWrapperRegex, '')
        : program.requiredTemplate.replace(divRegex, '');



      legalTextElement.textContent = '';
      const parts = template.split(/(<a href=".*?"
target=".*?">.*?<\/a>)/g);
      parts.forEach(function(part) {
        if (!part) {
          return;
        }
        const anchorMatch = part.match(/<a href="(.*?)"
target="(.*?)">(.*?)<\/a>/);
        if (anchorMatch) {
          const linkElement = document.createElement('a');
          linkElement.href = sanitizeUrl(anchorMatch[1]);
          linkElement.target = sanitizeHtml(anchorMatch[2]);
          linkElement.textContent = sanitizeHtml(anchorMatch[3]);
          legalTextElement.appendChild(linkElement);
        } else {
          legalTextElement.appendChild(document.createTextNode(part));
        }
      });

    }

    function generateDropdownOptions(smsProgramData) {
      if (!smsProgramData || smsProgramData.length === 0) {
        return '';
      }

      var programs = false
        ? smsProgramData.filter(function(p, i, arr) {
            return arr.findIndex(function(q) { return q.countryCode ===
p.countryCode; }) === i;
          })
        : smsProgramData;

      return programs.map(program => {
        const flag = getCountryUnicodeFlag(program.countryCode);
        const countryName = getCountryName(program.countryCode);
        const callingCode = program.countryCallingCode || '';
        // Sanitize all values to prevent XSS
        const sanitizedCountryCode = sanitizeHtml(program.countryCode ||
'');
        const sanitizedCountryName = sanitizeHtml(countryName || '');
        const sanitizedCallingCode = sanitizeHtml(callingCode || '');
        return '<option value="' + sanitizedCountryCode + '">' +
sanitizedCountryName + ' ' + sanitizedCallingCode + '</option>';
      }).join('');
    }

    function getCountryName(countryCode) {
      if (window.MC?.smsPhoneData?.smsProgramDataCountryNames &&
Array.isArray(window.MC.smsPhoneData.smsProgramDataCountryNames)) {
        for (let i = 0; i <
window.MC.smsPhoneData.smsProgramDataCountryNames.length; i++) {
          if (window.MC.smsPhoneData.smsProgramDataCountryNames[i].code ===countryCode) {
            return
window.MC.smsPhoneData.smsProgramDataCountryNames[i].name;
          }
        }
      }
      return countryCode;
    }

    function getDefaultPlaceholder(countryCode) {
      if (!countryCode || typeof countryCode !== 'string') {
        return '+1 000 000 0000'; // Default US placeholder
      }

            var mockPlaceholders = [
        {
          countryCode: 'US',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the US country code +1 before the phone
number',
        },
        {
          countryCode: 'GB',
          placeholder: '+44 0000 000000',
          helpText: 'Include the GB country code +44 before the phone
number',
        },
        {
          countryCode: 'CA',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the CA country code +1 before the phone
number',
        },
        {
          countryCode: 'AU',
          placeholder: '+61 000 000 000',
          helpText: 'Include the AU country code +61 before the phone
number',
        },
        {
          countryCode: 'DE',
          placeholder: '+49 00000000',
          helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl
+49 ein',
        },
        {
          countryCode: 'FR',
          placeholder: '+33 0 00 00 00 00',
          helpText: 'Incluez le code pays FR +33 avant le numéro de
téléphone',
        },
        {
          countryCode: 'ES',
          placeholder: '+34 000 000 000',
          helpText: 'Incluya el código de país ES +34 antes del número de
teléfono',
        },
        {
          countryCode: 'NL',
          placeholder: '+31 0 00000000',
          helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
        },
        {
          countryCode: 'BE',
          placeholder: '+32 00 00 00 00',
          helpText: 'Incluez le code pays BE +32 avant le numéro de
téléphone',
        },
        {
          countryCode: 'CH',
          placeholder: '+41 00 000 00 00',
          helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl
+41 ein',
        },
        {
          countryCode: 'AT',
          placeholder: '+43 000 000 0000',
          helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl
+43 ein',
        },
        {
          countryCode: 'IE',
          placeholder: '+353 00 000 0000',
          helpText: 'Include the IE country code +353 before the phone
number',
        },
        {
          countryCode: 'IT',
          placeholder: '+39 000 000 0000',
          helpText: 'Includere il prefisso internazionale IT +39 prima del
numero di telefono',
        },
      ];

      const selectedPlaceholder = mockPlaceholders.find(function(item) {
        return item && item.countryCode === countryCode;
      });

      return selectedPlaceholder ? selectedPlaceholder.placeholder :
mockPlaceholders[0].placeholder;
    }

    function updatePlaceholder(countryCode, fieldName) {
      if (!countryCode || !fieldName) {
        return;
      }

      const phoneInput = document.querySelector('#mce-' + fieldName);
      if (!phoneInput) {
        return;
      }

      const placeholder = getDefaultPlaceholder(countryCode);
      if (placeholder) {
        phoneInput.placeholder = placeholder;
      }
    }

    function updateCountryCodeInstruction(countryCode, fieldName) {
      updatePlaceholder(countryCode, fieldName);

    }

    function getDefaultHelpText(countryCode) {
      var mockPlaceholders = [
        {
          countryCode: 'US',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the US country code +1 before the phone
number',
        },
        {
          countryCode: 'GB',
          placeholder: '+44 0000 000000',
          helpText: 'Include the GB country code +44 before the phone
number',
        },
        {
          countryCode: 'CA',
          placeholder: '+1 000 000 0000',
          helpText: 'Include the CA country code +1 before the phone
number',
        },
        {
          countryCode: 'AU',
          placeholder: '+61 000 000 000',
          helpText: 'Include the AU country code +61 before the phone
number',
        },
        {
          countryCode: 'DE',
          placeholder: '+49 00000000',
          helpText: 'Fügen Sie vor der Telefonnummer die DE-Ländervorwahl
+49 ein',
        },
        {
          countryCode: 'FR',
          placeholder: '+33 0 0 00 00 00 00',
          helpText: 'Incluez le code pays FR +33 avant le numéro de
téléphone',
        },
        {
          countryCode: 'ES',
          placeholder: '+34 000 000 000',
          helpText: 'Incluya el código de país ES +34 antes del número de
teléfono',
        },
        {
          countryCode: 'NL',
          placeholder: '+31 0 00000000',
          helpText: 'Voeg de NL-landcode +31 toe vóór het telefoonnummer',
        },
        {
          countryCode: 'BE',
          placeholder: '+32 00 00 00 00',
          helpText: 'Incluez le code pays BE +32 avant le numéro de
téléphone',
        },
        {
          countryCode: 'CH',
          placeholder: '+41 00 000 00 00',
          helpText: 'Fügen Sie vor der Telefonnummer die CH-Ländervorwahl
+41 ein',
        },
        {
          countryCode: 'AT',
          placeholder: '+43 000 000 0000',
          helpText: 'Fügen Sie vor der Telefonnummer die AT-Ländervorwahl
+43 ein',
        },
        {
          countryCode: 'IE',
          placeholder: '+353 00 000 0000',
          helpText: 'Include the IE country code +353 before the phone
number',
        },
        {
          countryCode: 'IT',
          placeholder: '+39 000 000 0000',
          helpText: 'Includere il prefisso internazionale IT +39 prima del
numero di telefono',
        },
      ];

      if (!countryCode || typeof countryCode !== 'string') {
        return mockPlaceholders[0].helpText;
      }

      const selectedHelpText = mockPlaceholders.find(function(item) {
          return item && item.countryCode === countryCode;
        });

        return selectedHelpText ? selectedHelpText.helpText :
mockPlaceholders[0].helpText;
    }

    function setDefaultHelpText(countryCode) {
      const helpTextSpan = document.querySelector('#help-text');
      if (!helpTextSpan) {
        return;
      }


    }

    function updateHelpTextCountryCode(countryCode, fieldName) {
      if (!countryCode || !fieldName) {
        return;
      }

      setDefaultHelpText(countryCode);
    }

    function initializeSmsPhoneDropdown(fieldName) {
      if (!fieldName || typeof fieldName !== 'string') {
        return;
      }

      const dropdown = document.querySelector('#country-select-' +
fieldName);
      const displayFlag = document.querySelector('#flag-display-' +
fieldName);

      if (!dropdown || !displayFlag) {
        return;
      }

      const smsPhoneData = window.MC?.smsPhoneData;
      if (smsPhoneData && smsPhoneData.programs &&
Array.isArray(smsPhoneData.programs)) {
        dropdown.innerHTML = generateDropdownOptions(smsPhoneData.programs);
      }

      const defaultProgram =
getDefaultCountryProgram(smsPhoneData?.defaultCountryCode,
smsPhoneData?.programs);
      if (defaultProgram && defaultProgram.countryCode) {
        dropdown.value = defaultProgram.countryCode;

        const flagSpan = displayFlag?.querySelector('#flag-emoji-' +
fieldName);
        if (flagSpan) {
          flagSpan.textContent =
getCountryUnicodeFlag(defaultProgram.countryCode);
          flagSpan.setAttribute('aria-label',
sanitizeHtml(defaultProgram.countryCode) + ' flag');
        }

        updateSmsLegalText(defaultProgram.countryCode, fieldName);
        updatePlaceholder(defaultProgram.countryCode, fieldName);
        updateCountryCodeInstruction(defaultProgram.countryCode, fieldName);
      }


      var smsNotRequiredRemoveCountryCodeEnabled = true;
      var smsField = Object.values({"EMAIL":{"name":"EMAIL","label":"Email
Address","helper_text":"","type":"email","required":true,"audience_field_name":"Email
Address","merge_id":0,"help_text_enabled":false,"enabled":true,"order":0,"field_type":"merge"},"FNAME":{"name":"FNAME","label":"First
Name","helper_text":"","type":"text","required":true,"audience_field_name":"First
Name","merge_id":1,"help_text_enabled":false,"enabled":true,"order":1,"field_type":"merge"},"LNAME":{"name":"LNAME","label":"Last
Name","helper_text":"","type":"text","required":false,"audience_field_name":"Last
Name","merge_id":2,"help_text_enabled":false,"enabled":true,"order":2,"field_type":"merge"},"CITY":{"name":"CITY","label":"City","helper_text":"","type":"text","required":false,"audience_field_name":"City","merge_id":9,"help_text_enabled":false,"enabled":true,"order":3,"field_type":"merge"},"STATE":{"name":"STATE","label":"State","helper_text":"","type":"text","required":false,"audience_field_name":"State","merge_id":10,"help_text_enabled":false,"enabled":true,"order":4,"field_type":"merge"},"COUNTRY":{"name":"COUNTRY","label":"Country","helper_text":"","type":"text","required":false,"audience_field_name":"Country","merge_id":24,"help_text_enabled":false,"enabled":true,"order":5,"field_type":"merge"},"INSTRUMENT":{"name":"INSTRUMENT","label":"Instrument(s)","helper_text":"","type":"text","required":false,"audience_field_name":"Instrument(s)","merge_id":11,"help_text_enabled":false,"enabled":true,"order":6,"field_type":"merge"},"MMERGE24":{"name":"MMERGE24","label":"How
did you hear about
us?","helper_text":"","type":"text","required":false,"audience_field_name":"How
did you hear about
us?","merge_id":12,"help_text_enabled":false,"enabled":true,"order":7,"field_type":"merge"},"MMERGE27":{"name":"MMERGE27","label":"Questions,
comments,
suggestions?","helper_text":"","type":"text","required":false,"audience_field_name":"Questions,
comments,
suggestions?","merge_id":13,"help_text_enabled":false,"enabled":true,"order":8,"field_type":"merge"},"MMERGE5":{"name":"MMERGE5","label":"Company","helper_text":"","type":"text","required":false,"audience_field_name":"Company","merge_id":5,"help_text_enabled":false,"enabled":true,"order":9,"field_type":"merge"},"MMERGE4":{"name":"MMERGE4","label":"Phone","helper_text":"","type":"phone","required":false,"audience_field_name":"Phone","phoneformat":"US","enabled":false,"order":null,"field_type":"merge","merge_id":4},"MMERGE6":{"name":"MMERGE6","label":"Address","helper_text":"","type":"text","required":false,"audience_field_name":"Address","enabled":false,"order":null,"field_type":"merge","merge_id":6},"MMERGE7":{"name":"MMERGE7","label":"Zip
Code","helper_text":"","type":"zip","required":false,"audience_field_name":"Zip
Code","enabled":false,"order":null,"field_type":"merge","merge_id":7},"MMERGE3":{"name":"MMERGE3","label":"Job
Title","helper_text":"","type":"text","required":false,"audience_field_name":"Job
Title","enabled":false,"order":null,"field_type":"merge","merge_id":3},"interests_2497":{"name":"interests_2497","label":"List
Preference (choose Monthly for fewer
emails)","helper_text":"","type":"checkbox","required":false,"choices":[{"value":"1","label":"Concert
Announcements"},{"value":"2","label":"Monthly
list"}],"audience_field_name":"List
Preference (choose Monthly for fewer
emails)","enabled":false,"order":null,"field_type":"group","group_id":2497},"interests_2501":{"name":"interests_2501","label":"Be
Involved:","helper_text":"","type":"checkbox","required":false,"choices":[{"value":"4","label":"Perform!"},{"value":"8","label":"Volunteer!"},{"value":"16","label":"Donate!"}],"audience_field_name":"Be
Involved:","enabled":false,"order":null,"field_type":"group","group_id":2501}}).find(function(f)
{ return f.name === fieldName && f.type === 'smsphone'; });
      var isRequired = smsField ? smsField.required : false;
      var shouldAppendCountryCode = smsNotRequiredRemoveCountryCodeEnabled
? isRequired : true;

      var phoneInput = document.querySelector('#mce-' + fieldName);
      if (phoneInput && defaultProgram.countryCallingCode &&
shouldAppendCountryCode) {
        phoneInput.value = defaultProgram.countryCallingCode;
      }



      displayFlag?.addEventListener('click', function(e) {
        dropdown.focus();
      });


      dropdown?.addEventListener('change', function() {
        const selectedCountry = this.value;

        if (!selectedCountry || typeof selectedCountry !== 'string') {
          return;
        }

        const flagSpan = displayFlag?.querySelector('#flag-emoji-' +
fieldName);
        if (flagSpan) {
          flagSpan.textContent = getCountryUnicodeFlag(selectedCountry);
          flagSpan.setAttribute('aria-label', sanitizeHtml(selectedCountry)
+ ' flag');
        }


        const selectedProgram =
window.MC?.smsPhoneData?.programs.find(function(program) {
          return program && program.countryCode === selectedCountry;
        });

        var smsNotRequiredRemoveCountryCodeEnabled = true;
        var smsField =
Object.values({"EMAIL":{"name":"EMAIL","label":"Email
Address","helper_text":"","type":"email","required":true,"audience_field_name":"Email
Address","merge_id":0,"help_text_enabled":false,"enabled":true,"order":0,"field_type":"merge"},"FNAME":{"name":"FNAME","label":"First
Name","helper_text":"","type":"text","required":true,"audience_field_name":"First
Name","merge_id":1,"help_text_enabled":false,"enabled":true,"order":1,"field_type":"merge"},"LNAME":{"name":"LNAME","label":"Last
Name","helper_text":"","type":"text","required":false,"audience_field_name":"Last
Name","merge_id":2,"help_text_enabled":false,"enabled":true,"order":2,"field_type":"merge"},"CITY":{"name":"CITY","label":"City","helper_text":"","type":"text","required":false,"audience_field_name":"City","merge_id":9,"help_text_enabled":false,"enabled":true,"order":3,"field_type":"merge"},"STATE":{"name":"STATE","label":"State","helper_text":"","type":"text","required":false,"audience_field_name":"State","merge_id":10,"help_text_enabled":false,"enabled":true,"order":4,"field_type":"merge"},"COUNTRY":{"name":"COUNTRY","label":"Country","helper_text":"","type":"text","required":false,"audience_field_name":"Country","merge_id":24,"help_text_enabled":false,"enabled":true,"order":5,"field_type":"merge"},"INSTRUMENT":{"name":"INSTRUMENT","label":"Instrument(s)","helper_text":"","type":"text","required":false,"audience_field_name":"Instrument(s)","merge_id":11,"help_text_enabled":false,"enabled":true,"order":6,"field_type":"merge"},"MMERGE24":{"name":"MMERGE24","label":"How
did you hear about
us?","helper_text":"","type":"text","required":false,"audience_field_name":"How
did you hear about
us?","merge_id":12,"help_text_enabled":false,"enabled":true,"order":7,"field_type":"merge"},"MMERGE27":{"name":"MMERGE27","label":"Questions,
comments,
suggestions?","helper_text":"","type":"text","required":false,"audience_field_name":"Questions,
comments,
suggestions?","merge_id":13,"help_text_enabled":false,"enabled":true,"order":8,"field_type":"merge"},"MMERGE5":{"name":"MMERGE5","label":"Company","helper_text":"","type":"text","required":false,"audience_field_name":"Company","merge_id":5,"help_text_enabled":false,"enabled":true,"order":9,"field_type":"merge"},"MMERGE4":{"name":"MMERGE4","label":"Phone","helper_text":"","type":"phone","required":false,"audience_field_name":"Phone","phoneformat":"US","enabled":false,"order":null,"field_type":"merge","merge_id":4},"MMERGE6":{"name":"MMERGE6","label":"Address","helper_text":"","type":"text","required":false,"audience_field_name":"Address","enabled":false,"order":null,"field_type":"merge","merge_id":6},"MMERGE7":{"name":"MMERGE7","label":"Zip
Code","helper_text":"","type":"zip","required":false,"audience_field_name":"Zip
Code","enabled":false,"order":null,"field_type":"merge","merge_id":7},"MMERGE3":{"name":"MMERGE3","label":"Job
Title","helper_text":"","type":"text","required":false,"audience_field_name":"Job
Title","enabled":false,"order":null,"field_type":"merge","merge_id":3},"interests_2497":{"name":"interests_2497","label":"List
Preference (choose Monthly for fewer
emails)","helper_text":"","type":"checkbox","required":false,"choices":[{"value":"1","label":"Concert
Announcements"},{"value":"2","label":"Monthly
list"}],"audience_field_name":"List
Preference (choose Monthly for fewer
emails)","enabled":false,"order":null,"field_type":"group","group_id":2497},"interests_2501":{"name":"interests_2501","label":"Be
Involved:","helper_text":"","type":"checkbox","required":false,"choices":[{"value":"4","label":"Perform!"},{"value":"8","label":"Volunteer!"},{"value":"16","label":"Donate!"}],"audience_field_name":"Be
Involved:","enabled":false,"order":null,"field_type":"group","group_id":2501}}).find(function(f)
{ return f.name === fieldName && f.type === 'smsphone'; });
        var isRequired = smsField ? smsField.required : false;
        var shouldAppendCountryCode =
smsNotRequiredRemoveCountryCodeEnabled ? isRequired : true;

        var phoneInput = document.querySelector('#mce-' + fieldName);
        if (phoneInput && selectedProgram.countryCallingCode &&
shouldAppendCountryCode) {
          phoneInput.value = selectedProgram.countryCallingCode;
        }


        updateSmsLegalText(selectedCountry, fieldName);
        updatePlaceholder(selectedCountry, fieldName);
        updateCountryCodeInstruction(selectedCountry, fieldName);
      });
    }

    document.addEventListener('DOMContentLoaded', function() {
      const smsPhoneFields =
document.querySelectorAll('[id^="country-select-"]');

      smsPhoneFields.forEach(function(dropdown) {
        const fieldName = dropdown?.id.replace('country-select-', '');
        initializeSmsPhoneDropdown(fieldName);
      });
    });
    </script></div>`;

export default function Footer() {
  const socials = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/classicalrev/',
      // Inline SVG for Facebook
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/classicalrevolution',
      // Inline SVG for Instagram
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584 .012 4.85 .07 3.252 .148 4.771 1.691 4.919 4.919 .058 1.265 .069 1.645 .069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266 .058-1.644 .07-4.85 .07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 .013-3.583 .07-4.849 .149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667 .014-4.947 .072-4.358 .2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 .014 3.668 .072 4.948 .2 4.358 2.618 6.78 6.98 6.98 1.281 .058 1.689 .072 4.948 .072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98 .059-1.28 .073-1.689 .073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441 .645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'Youtube',
      url: 'https://www.youtube.com/@classicalrevolution',
      // Inline SVG for Youtube
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897 .266-4.356 2.62-4.385 8.816 .029 6.185 .484 8.549 4.385 8.816 3.6 .245 11.626 .246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <Link
            href="/"
            className="text-xl font-bold tracking-tighter uppercase italic text-zinc-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            Classical <span className="text-red-600">Revolution</span>
          </Link>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Chamber Music For The People
          </p>
        </div>

        <div className="flex gap-6">
          {socials.map((social) => (
            <Link
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-600 transition-colors p-2"
              aria-label={social.name}
            >
              {social.icon}
            </Link>
          ))}
        </div>

        <div className="text-center md:text-right space-y-2">
          <div className="flex justify-center md:justify-end gap-4 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">
            © {new Date().getFullYear()} Classical Revolution <br />
            San Francisco, CA
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-6 mt-8">
        <div dangerouslySetInnerHTML={{ __html: mailchimpEmbed }} />
      </div>
    </footer>
  );
}
