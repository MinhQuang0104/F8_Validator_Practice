function Validator (options) {

    formElement = document.querySelector(options.form_selector);

    function validate(inputElement, rule) {
        var errorMessage = rule.test(inputElement.value);
        var form_group = inputElement.closest(options.form_group);

        // console.log(errorMessage)
        if(errorMessage){
            // Có lỗi => Đổi class để UI lỗi hiển thị
            // Làm sao để lấy ra "chính xác" form-group đang chứa ô input gọi tới hàm test
            form_group.classList.add(options.error_class);
            form_group.querySelector(options.form_message).innerText = errorMessage
        } 
        else {
            // Nếu không lỗi thì gỡ class invalid đi 
            form_group.classList.remove(options.error_class);
            form_group.querySelector(options.form_message).innerText = errorMessage;
        }
    }

    // Xử lý sk (blur, input,...) cho các element dựa vào selector trong rule
    options.rules.forEach(function (rule) {
        // // Từ selector của form, tìm tới element của ô input
        var inputElement = formElement.querySelector(rule.selector);
        inputElement.onblur = function() {
            validate(inputElement, rule);
        }
        inputElement.oninput = function() {
            var form_group = inputElement.closest(options.form_group);
            form_group.classList.remove(options.error_class);
            form_group.querySelector(options.form_message).innerText = '';

        }
    });
}

Validator.isRequire = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            // Nếu giá trị (Value) ô input null thì, chuỗi rỗng được xem là falsy (Boolean)
            // kiểm tra value, nếu rỗng thì trả về thông báo lỗi, không rỗng thì trả về 
            // "" để set lại value cho ô message
            return value.length ?  "" : "Vui lòng không để trống trường này" ;
        }
    };
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            // Dùng biểu thức chính quy để check email nhập vào, hàm test của biểu thức chính quy trả về true/false 
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) ? "" : "email không hợp lệ";
        }
    };
}

Validator.isPassword = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= 6 ? "" : "Mật khẩu phải có ít nhất 6 ký tự";
        }
    };
}


Validator.isConfirm = function (selector, cb) {
    return {
        selector: selector,
        test: function(value) {
            return value == cb() ? "" : "Mật khẩu xác nhận không chính xác";
        }
    };
}