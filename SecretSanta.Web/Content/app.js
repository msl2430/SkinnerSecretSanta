VeeValidate.Validator.localize({
    en: {
        messages: {
            email: 'Please input a valid email address.',            
        },
        custom: {
            firstName: {
                required: "First name is required."
            },
            lastName: {
                required: "Last name is required."
            },
            email: {
                required: "Your email address is required."
            },
            'login-email': {
                required: "Your email address is required."
            },
            billingFirstName: {
                required: "First name is required."
            },
            billingLastName: {
                required: "Last name is required."
            },
            billingEmail: {
                required: "Your email address is required."
            },
            billingAddress1: {
                required: "Address 1 is required."
            },
            billingCity: {
                required: "City is required."
            },
            billingZipCode: {
                required: "Postal code is required."
            },
            shippingFirstName: {
                required: "First name is required."
            },
            shippingLastName: {
                required: "Last name is required."
            },
            shippingEmail: {
                required: "Your email address is required."
            },
            shippingAddress1: {
                required: "Address 1 is required."
            },
            shippingCity: {
                required: "City is required."
            },
            shippingZipCode: {
                required: "Postal code is required."
            },
            'login-password': {
                required: "Your password is required.",
                min: "Your password is required to be at least 8 characters.",
            },
            password: {
                required: "Your password is required.",
                min: "Your password is required to be at least 8 characters.",
            },
            confirmPassword: {
                required: "You are required to confirm your password."
            },
            pin: {
                required: "Your pin is required.",
                numeric: "Your pin is required to be at least 5 numbers.",
                min: "Your pin is required to be at least 5 numbers.",
            },
            confirmPin: {
                required: "You are required to confirm your pin.",
                numeric: "Your pin is required to be at least 5 numbers.",
            },
        }
    }
});

Vue.use(VeeValidate);
Vue.prototype.$moment = moment; //moment.js

var telephoneFilter = function (value) {
    if (!value) return '';
    value = value.toString();
    var tel = value;
    if (!tel) { return ''; }

    var regTest = tel.toString().trim().replace(/^\+/, '');
    
    if (regTest.match(/[^0-9]/)) {
        return tel;
    }
    
    var country = {};
    var city = {}
    var number = {};
    
    switch (tel.length) {
    case 10: // +1PPP####### -> C (PPP) ###-####
        country = 1;
        city = value.slice(0, 3);
        number = value.slice(3);
        break;

    case 11: // +CPPP####### -> CCC (PP) ###-####
        country = value[0];
        city = value.slice(1, 4);
        number = value.slice(4);
        break;

    case 12: // +CCCPP####### -> CCC (PP) ###-####
        country = value.slice(0, 3);
        city = value.slice(3, 5);
        number = value.slice(5);
        break;

    default:
        return tel;
    }

    if (country === 1) {
        country = "";
    }
    
    number = number.slice(0, 3) + '-' + number.slice(3);
    
    return (country + " (" + city + ") " + number).trim();
}

