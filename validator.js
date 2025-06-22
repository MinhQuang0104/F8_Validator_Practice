function Validator (options) {

    var formElement = document.querySelector(options.form_selector);
    var formRules = {}

    function validate(inputElement, rule) {
        var errorMessage // = rule.test(inputElement.value);
        var form_group = inputElement.closest(options.form_group);

        // Duyệt qua formRules để xử lý cho nhiều rule và xác định errormessage
        for(var i= 0; i < formRules[rule.selector].length; i++) {
            errorMessage = formRules[rule.selector][i](inputElement.value);
            if(errorMessage)
                break;
        }
        
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
        return !errorMessage;
    }

    // Xử lý sk (blur, input,...) cho các element dựa vào selector trong rule
    options.rules.forEach(function (rule) {
        // Trong khi duyệt qua các rule thì lấy thêm chúng vào obj 
        if(formRules[rule.selector]) {
            // Đã tồn tại => Chèn thêm vào
            formRules[rule.selector].push(rule.test);
        } 
        else {
            // Nếu chưa tồn tại thì tạo mới, 
            formRules[rule.selector] = [rule.test]
        }
        // Từ selector của form, tìm tới element của ô input
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

    // Xử lý sự kiện submit form 
    // Validate toàn bộ, lấy dữ liệu từ ô input 
    formElement.onsubmit = function (e) {
        if(options.onSubmit) {
            e.preventDefault();
            var data = {}
            var isPass = true
            // validate tất cả các ô input
            options.rules.forEach(function (rule){
                var inputElement = formElement.querySelector(rule.selector);
                if(!validate(inputElement, rule))
                    isPass = false
            })
            // Phải đảm bảo không có lỗi thì mới lấy dữ liệu 
            // lấy dữ liệu từ ô input để truyền đối số vào cb 
            console.log(isPass)
            if(isPass) {
                console.log("get data")
                options.rules.forEach(function (rule){
                    data[rule.selector] = formElement.querySelector(rule.selector).value;
                }) 
                options.onSubmit(data);
                
            }
        }
    }
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