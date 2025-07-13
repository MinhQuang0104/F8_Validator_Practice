function Validator(options) {

    var formElement = document.querySelector(options.form_selector);
    var formRules = {}
    // 2 tham số của hàm validate() 
    // para1: 1 element node,
    // para2: 1 obj gồm string selector(#fullname) và 1 hàm test() (Nội dung hàm test Thay đổi tùy vào rule)
    // Hàm validate() này làm gì ? lấy giá trị trên ô input và kiểm tra giá trị lấy ra với hàm test NHẮM xác định error Message, sau đó hiển thị error message lên UI
    // Dạng giá trị của ô input có thể là textbox, radiobutton, checkbox, file, ... nên phải xử lý với từng trường hợp riêng này 
    function validate(inputElement, rule) {
        var errorMessage // = rule.test(inputElement.value);
        var form_group = inputElement.closest(options.form_group);
        // FormRulse mà 1 obj lưu thông tin những gồm: key, tên selector, 
        // value của 1 key trong formRules: mảng chứa hàm test tương ứng với các rule mà selector đã "Truyền vào"
       
        var rules = formRules[rule.selector]; // CHỈ LẤY RA 1 cặp key value của 1 selector tương ứng để xử lý
        // Duyệt qua rules để xử lý nếu có nhiều selector trùng nhau( radio,...)và xác định errormessage thông qua việc gọi hàm test
        
        for (var i = 0; i < rules.length; i++) {
            // Chọc tới rule và dựa vào Selector để gọi thẳng tới hàm test() của rule để trả về errorMessage
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        // querySelector sẽ trả về null nếu không tìm thấy => hàm test nhận giá trị falsy => Hiển thị thông báo lỗi
                        // Nếu tìm thấy => hàm test nhận truthy => Thông báo lỗi = "" (Không hiển thị)
                        formElement.querySelector(rule.selector + ":checked") 
                    );
                    // console.log("radio/checkbox ERROR MESSAGE: " + errorMessage);
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage)
                break;
        }
        
        // console.log(errorMessage)
        if (errorMessage) {
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
        if (formRules[rule.selector]) {
            // Đã tồn tại => Chèn thêm vào
            formRules[rule.selector].push(rule.test);
        }
        else {
            // Nếu chưa tồn tại thì tạo mới, 
            formRules[rule.selector] = [rule.test]
        }
        // Từ selector của form, tìm tới element của ô input
        // Sử dụng querySelectorAll để có thể lấy ra tất cả element đối với trường hợp của checkbox, radio có nhiều phần tử trùng selector 
        var inputElements = Array.from(formElement.querySelectorAll(rule.selector));
        // console.log(inputElements)
        inputElements.forEach(function (inputElement) {
            inputElement.onblur = function () {
                validate(inputElement, rule);
            }
            inputElement.oninput = function () {
                // Đối với hàm oninput cho Radiobutton và check box sự kiện này được
                // Kích hoạt khi bâm vào => Giá trị thay đổi => SK kích hoạt[]
                var form_group = inputElement.closest(options.form_group);
                form_group.classList.remove(options.error_class);
                form_group.querySelector(options.form_message).innerText = '';
            }
        })

    });
    // console.log({ formRules });
    // Xử lý sự kiện submit form 
    // Validate toàn bộ, lấy dữ liệu từ ô input 
    formElement.onsubmit = function (e) {
        e.preventDefault();
        if (options.onSubmit) {
            var data = {}
            var isPass = true
            // validate tất cả các ô input
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                if (!validate(inputElement, rule))
                    isPass = false
            })
            // Phải đảm bảo không có lỗi thì mới lấy dữ liệu 
            // lấy dữ liệu từ ô input để truyền đối số vào cb 
            console.log(isPass)
            if (isPass) {
                console.log("get data: "+ data);
                options.rules.forEach(function (rule) {
                    var inputElements = Array.from(formElement.querySelectorAll(rule.selector));
                    // Mỗi phần tử trong inputElement sẽ là 1 nodelist 
                    // duyệt qua inputElements để kiểm tra type của từng element nhắm xác định chính xác cách để lấy dữ liệu
                    inputElements.forEach((inputElement) => {
                        switch(inputElement.type) {
                            case "checkbox":
                                // if(data[rule.selector]){
                                //     // Nêu key check box dã có thì push thêm vào
                                //     data[rule.selector].push(formElement.querySelector(rule.selector + ":checked").value);
                                // }  
                                // else // key checkbox chưa có thì tạo mới 
                                //     data[rule.selector] =  [formElement.querySelector(rule.selector + ":checked").value];
                                
                                // Nếu thẻ checkbox hiện tại được chọn thì mới thực hiện tiếp
                                if(inputElement.matches(":checked")) {
                                    if(!Array.isArray(data[rule.selector])) {
                                        data[rule.selector] = []
                                    }
                                    data[rule.selector].push(inputElement.value)
                                }
                                break;
                            case "radio":
                                data[rule.selector] = formElement.querySelector(rule.selector + ":checked").value;
                                break;
                            case "file":
                                data[rule.selector] = inputElement.files;
                                break;
                            default:
                                data[rule.selector] = inputElement.value;

                        }
                    })
                })
                options.onSubmit(data);

            }
        }
    }
}

Validator.isRequire = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // Nếu giá trị (Value) ô input null thì, chuỗi rỗng được xem là falsy (Boolean)
            // kiểm tra value, nếu rỗng thì trả về thông báo lỗi, không rỗng thì trả về 
            // "" để set lại value cho ô message
            return value ? "" : message ||"Vui lòng không để trống trường này";
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // Dùng biểu thức chính quy để check email nhập vào, hàm test của biểu thức chính quy trả về true/false 
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) ? "" : message || "email không hợp lệ";
        }
    };
}

Validator.isPassword = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= 6 ? "" : message || "Mật khẩu phải có ít nhất 6 ký tự";
        }
    };
}


Validator.isConfirm = function (selector, cb, message) {
    return {
        selector: selector,
        test: function (value) {
            return value == cb() ? "" : message || "Mật khẩu xác nhận không chính xác";
        }
    };
}