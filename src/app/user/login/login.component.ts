import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { reduce } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    email : '',
    password: ''
  }
  showAlert = false
  alertMsg = 'Espera un momento... Se esta iniciando tu sesión.'
  alertColor = "neutral"
  loading = false
  inSubmission = false

  constructor(private auth: AngularFireAuth) { }

  ngOnInit(): void {
  }
  async login() {
    this.showAlert = true
    this.alertMsg = 'Espera un momento... Se esta iniciando tu sesión.'
    this.alertColor = "neutral"
    this.inSubmission = true
    this.loading = true

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      )
    } catch (e) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = '¡Ha ocurrido un error! Por favor vuelve a iniciar sesión más tarde.'
      console.log(e)
      return
    }

    this.alertMsg = '¡Listo! Has iniciado sesión.'
    this.alertColor = 'green'
    this.loading = false
  }

}
