---
title: Post Title
namespace: ""
category: "category"
tags:
    - tag
    - another tag
header:
    teaser: http://xxx.xx/image.png
    og_image: http://xxx.xx/image.png
date: 
last_modified_at:
---

## Installing VS Code

## Running Notebooks Locally

## Running Notebooks in Azure ML

---

## Installing Anaconda

## Installing Jupyter in a separated conda environment

Open Anaconda prompt and run the following commands

Create a new conda environment

```output
(base) PS C:\Repositories> conda create --name jupyter python
Collecting package metadata (current_repodata.json): done
Solving environment: done

## Package Plan ##

  environment location: C:\Users\dacruz\Anaconda3\envs\jupyter

  added / updated specs:
    - python


The following NEW packages will be INSTALLED:

  ca-certificates    pkgs/main/win-64::ca-certificates-2021.1.19-haa95532_0
  certifi            pkgs/main/win-64::certifi-2020.12.5-py39haa95532_0
  openssl            pkgs/main/win-64::openssl-1.1.1i-h2bbff1b_0
  pip                pkgs/main/win-64::pip-20.3.3-py39haa95532_0
  python             pkgs/main/win-64::python-3.9.1-h6244533_2
  setuptools         pkgs/main/win-64::setuptools-51.3.3-py39haa95532_4
  sqlite             pkgs/main/win-64::sqlite-3.33.0-h2a8f88b_0
  tzdata             pkgs/main/noarch::tzdata-2020f-h52ac0ba_0
  vc                 pkgs/main/win-64::vc-14.2-h21ff451_1
  vs2015_runtime     pkgs/main/win-64::vs2015_runtime-14.27.29016-h5e58377_2
  wheel              pkgs/main/noarch::wheel-0.36.2-pyhd3eb1b0_0
  wincertstore       pkgs/main/win-64::wincertstore-0.2-py39h2bbff1b_0
  zlib               pkgs/main/win-64::zlib-1.2.11-h62dcd97_4


Proceed ([y]/n)? y

Preparing transaction: done
Verifying transaction: done
Executing transaction: done
#
# To activate this environment, use
#
#     $ conda activate jupyter
#
# To deactivate an active environment, use
#
#     $ conda deactivate

(base) PS C:\Repositories>
```

Activating the environment

```powershell
conda activate jupyter
```

Installing Jupyterlab, the most recent version of jupyter notebooks

```powershell
(jupyter) PS C:\Repositories> conda install -c conda-forge jupyterlab
Collecting package metadata (current_repodata.json): done
Solving environment: done

## Package Plan ##

  environment location: C:\Users\dacruz\Anaconda3\envs\jupyter

  added / updated specs:
    - jupyterlab


The following NEW packages will be INSTALLED:

[ ... ] (All Packages to be installed)

The following packages will be UPDATED:

  certifi            pkgs/main::certifi-2020.12.5-py39haa9~ --> conda-forge::certifi-2020.12.5-py39hcbf5309_1

The following packages will be SUPERSEDED by a higher-priority channel:

  ca-certificates    pkgs/main::ca-certificates-2021.1.19-~ --> conda-forge::ca-certificates-2020.12.5-h5b45459_0
  openssl              pkgs/main::openssl-1.1.1i-h2bbff1b_0 --> conda-forge::openssl-1.1.1i-h8ffe710_0


Proceed ([y]/n)? y

Preparing transaction: done
Verifying transaction: done
Executing transaction: done
```

To ensure Jupyter notebooks will be executed from the active environment, run the command below to create a kernelspec for the running userprofile

```output
(jupyter) PS C:\Repositories> python -m ipykernel install --user --name jupyter
Installed kernelspec jupyter in C:\Users\dacruz\AppData\Roaming\jupyter\kernels\jupyter
```

At this moment we might be already set to run basic jupyter notebooks on our system. In order to test it out, you can start jupyterlab from anaconda prompt like below

```output
(base) PS C:\Repositories> conda activate jupyter
(jupyter) PS C:\Repositories> jupyter-lab.exe
[I 2021-01-22 10:13:11.044 ServerApp] jupyterlab | extension was successfully linked.
[W 2021-01-22 10:13:11.070 ServerApp] The 'min_open_files_limit' trait of a ServerApp instance expected an int, not the NoneType None.
[I 2021-01-22 10:13:11.154 LabApp] JupyterLab extension loaded from C:\Users\dacruz\Anaconda3\envs\jupyter\lib\site-packages\jupyterlab
[I 2021-01-22 10:13:11.154 LabApp] JupyterLab application directory is C:\Users\dacruz\Anaconda3\envs\jupyter\share\jupyter\lab
[I 2021-01-22 10:13:11.159 ServerApp] jupyterlab | extension was successfully loaded.
[I 2021-01-22 10:13:11.690 ServerApp] nbclassic | extension was successfully loaded.
[I 2021-01-22 10:13:11.904 ServerApp] Serving notebooks from local directory: C:\Repositories
[I 2021-01-22 10:13:11.904 ServerApp] Jupyter Server 1.2.2 is running at:
[I 2021-01-22 10:13:11.905 ServerApp] http://localhost:8888/lab?token=b20af7a217a4f9afd616abe415e7d82722df14b12cacb994
[I 2021-01-22 10:13:11.905 ServerApp]  or http://127.0.0.1:8888/lab?token=b20af7a217a4f9afd616abe415e7d82722df14b12cacb994
[I 2021-01-22 10:13:11.905 ServerApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
[C 2021-01-22 10:13:11.971 ServerApp]

    To access the server, open this file in a browser:
        file:///C:/Users/dacruz/AppData/Roaming/jupyter/runtime/jpserver-24924-open.html
    Or copy and paste one of these URLs:
        http://localhost:8888/lab?token=b20af7a217a4f9afd616abe415e7d82722df14b12cacb994
     or http://127.0.0.1:8888/lab?token=b20af7a217a4f9afd616abe415e7d82722df14b12cacb994
[W 2021-01-22 10:13:16.995 LabApp] Could not determine jupyterlab build status without nodejs
```

This will pop a browser window connecting to port 8888 on localhost, where the python webserver was started.

![image-20210122101549590](https://i.imgur.com/GrDIRB8.png)

To do a basic test, I'll be opening the file *A Getting Started Guide For Azure Sentinel Notebooks.ipynb* from [Azure/Azure-Sentinel-Notebooks repository at GitHub](https://github.com/Azure/Azure-Sentinel-Notebooks) which has a few cells where we can test the execution.

On first open, keep in mind to select the proper conda environment, in this case **jupyter**, so we can test the execution

![image-20210122101855066](https://i.imgur.com/lkSUIcj.png)

Going straight to the *Running code* section, there are a few cells we can run to test the environment, as well as check some information:

1. In the upper right corner of the page you can confirm which kernel is being used, to ensure you're running from the correct conda environment
2. In Jupyter Notebooks there are cells containing Markdown and code. the second one allows you to run directly from the notebook. you can use several languages on it, being python one of the most popular ones
3. to run code in the selected cell you can hit the "play" button in the menu or using the Ctrl+Enter combination
4. After executing the code, the ouput, if any, will be shown right below the respective code cell

![image-20210122102812799](https://i.imgur.com/EYapKMD.png)

## Preparing for Sentinel Notebooks

xxxx

## Running a sample notebook locally

xxxx
