﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LangShare.Controllers {

    [Authorize]
    public class HomeController : Controller {

        public ViewResult Index() {

            return View();
        }
    }
}