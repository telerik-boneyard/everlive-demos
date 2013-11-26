(function() {

  // cache references to input controls
  var password = $('#password');
  var confirmPassword = $('#confirm-password');
  var email = $('#email');
  var confirmEmail = $('#confirm-email');

  var state = {};

  var validator = $("#register-form").kendoValidator({

    rules: {

      matches: function(input) {

        var matches = input.data('matches');

        // if the `data-matches attribute was found`
        if (matches) {

          // get the input to match
          var match = $(matches);

          // trim the values and check them
          if ( $.trim(input.val()) === $.trim(match.val()) )  {

            // the fields match
            return true;

          } else {

            // the fields don't match - validation fails
            return false;

          }

        }

        // don't perform any match validation on the input
        return true;

      },

      availability: function(input) {

        var validate = input.data('available');

        if (typeof validate !== 'undefined' && validate !== false) {

          var id = input.attr('id');
          
          var cache = availability.cache[id] = availability.cache[id] || {};

          cache.checking = true;

          var settings = {
            url: input.data('availableUrl') || '',
            message: kendo.template(input.data('availableMsg')) || ''
          };

          if (cache.value === input.val() && cache.valid) {

            // the value is available

            return true;

          }


          if (cache.value === input.val() && !cache.valid) {

            // the value is not available

            cache.checking = false;
            return false;

          }

          availability.check(input, settings);

          return false;

        }

        return true;

      }
    },

    messages: {

      // custom error messages. email gets picked up 
      // automatically for any inputs of that type
      matches: function(input) {
        var msg = input.data("matchesMsg");
        return msg;
      },
      email: 'That doesn\'t appear to be a valid email address',
      availability: function(input) {
        
        var id = input.attr('id');
        var msg = kendo.template(input.data('availableMsg') || '');
        var cache = availability.cache[id];

        if (cache.checking) {
          return "Checking..."
        }

        else {

          return msg(input.val());

        }
      }
    }

  }).data('kendoValidator');

  var availability = {
    
    cache: {},

    check: function(element, settings) {

      var id = element.attr('id');
      var cache = this.cache[id] = this.cache[id] || {};

      $.ajax({
        url: settings.url,
        dataType: 'json',
        data: { value: element.val() },
        
        success: function(data) {

          cache.valid = data;

          validator.validateInput(element);

        },
        
        failure: function() {

          cache.valid = true;

        },
        
        complete: function() {

          cache.value = element.val();
        
        }
      });

    }
      
  };

}());