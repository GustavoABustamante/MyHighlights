import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

  showAlert = false
  alertMsg = ""
  alertColor = "neutral"
  loading = false
  inSubmission = false

  name = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  email = new FormControl('', [
    Validators.required,
    Validators.email
  ], [this.emailTaken.validate]);
  age = new FormControl('',[
    Validators.required,
    Validators.min(18),
    Validators.max(120)
  ]);
  password = new FormControl('',[
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ]);
  confirm_password = new FormControl('',[
    Validators.required,

  ]);
  phoneNumber = new FormControl('',[
    Validators.required,
    Validators.minLength(15),
    Validators.maxLength(15),
  ]);

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber
  }, [RegisterValidators.match('password', 'confirm_password')])

  async register() {
    this.showAlert = true
    this.alertMsg = "¡Espera un minuto! Estamos registrando tu cuenta..."
    this.alertColor = "neutral"
    this.inSubmission = true
    this.loading = true
  
    try {
      await this.auth.createUser(this.registerForm.value as IUser)
    } catch (error) {
      console.error(error)
      this.alertMsg = '¡Ha ocurrido un error! Por favor vuelve a iniciar sesión más tarde.'
      this.alertColor = 'red'
      this.inSubmission = false
      this.loading = false
      return
    }
    this.alertMsg = '¡Tu cuenta ha sido creada con éxito!'
    this.alertColor = 'green'
    this.loading = false
  }
}
