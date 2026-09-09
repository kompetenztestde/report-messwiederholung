from django.conf import settings

def frontend_files(request):
    frontend_assets_dir = settings.BASE_DIR.joinpath("static")
    js_files = [file.relative_to(frontend_assets_dir) for file in frontend_assets_dir.glob("**/*.js")]
    print(999, js_files, frontend_assets_dir)
    css_files = [file.relative_to(frontend_assets_dir) for file in frontend_assets_dir.glob("**/*.css")]
    print(777, css_files)

    return {
        "js_files": list(js_files),
        "css_files": list(css_files)
    }
